type Refresh = () => Promise<unknown>;
type OrderQuery = { accountId: string; url: string; refreshers: Set<Refresh> };
const queries = new WeakMap<object, Map<string, OrderQuery>>();

/** Retain bound infinite-query refreshers so every loaded page is revalidated. */
export function registerOrderQueryRefresh(
  cache: object,
  url: unknown,
  accountId: string | undefined,
  refresh: Refresh,
) {
  if (
    !accountId ||
    typeof url !== "string" ||
    !/(?:^|\/)v1\/(?:algo\/)?orders(?:\?|$)/.test(url)
  )
    return () => {};
  let groups = queries.get(cache);
  if (!groups) {
    groups = new Map();
    queries.set(cache, groups);
  }
  const key = JSON.stringify([url, accountId]);
  let group = groups.get(key);
  if (!group) {
    group = { accountId, url, refreshers: new Set() };
    groups.set(key, group);
  }
  group.refreshers.add(refresh);
  return () => {
    group.refreshers.delete(refresh);
    if (!group.refreshers.size) groups.delete(key);
  };
}

/** Deduplicate mounted queries; a refresh failure must not mask a mutation error. */
export async function refreshAccountOrderQueries(
  cache: object,
  accountId: string,
  isCurrent: () => boolean,
) {
  const refreshers = Array.from(queries.get(cache)?.values() ?? [])
    .filter((group) => group.accountId === accountId)
    .map((group) => group.refreshers.values().next().value as Refresh);
  await Promise.allSettled(
    refreshers.map((refresh) =>
      Promise.resolve().then(() => (isCurrent() ? refresh() : undefined)),
    ),
  );
}

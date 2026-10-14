type Refresh = () => Promise<unknown>;
type OrderQuery = {
  accountId: string;
  url: string;
  refreshers: Set<Refresh>;
  timer?: ReturnType<typeof setTimeout>;
  inFlight?: boolean;
  dirty?: boolean;
  lastStartedAt?: number;
};
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
    if (!group.refreshers.size) {
      clearTimeout(group.timer);
      groups.delete(key);
    }
  };
}

/** Refresh one mounted query, coalescing events and limiting starts to once a second. */
export function scheduleOrderQueryRefresh(
  cache: object,
  url: string,
  accountId: string,
  isCurrent: () => boolean,
  report = true,
) {
  const groups = queries.get(cache);
  const key = JSON.stringify([url, accountId]);
  const group = groups?.get(key);
  if (!group || !isCurrent()) return;
  // Activations join an existing refresh; execution reports require a follow-up.
  if (!report && group.inFlight) return;
  group.dirty = true;
  if (group.timer || group.inFlight) return;

  const delay = Math.max(200, (group.lastStartedAt ?? 0) + 1000 - Date.now());
  group.timer = setTimeout(async () => {
    group.timer = undefined;
    if (!isCurrent() || groups?.get(key) !== group) return;
    const refresh = group.refreshers.values().next().value;
    if (!refresh) return;
    group.dirty = false;
    group.inFlight = true;
    group.lastStartedAt = Date.now();
    try {
      // Bound infinite mutate() refreshes every loaded page, including custom caches.
      await refresh();
    } catch {
      // Keep the last valid data; query error handling owns the failure.
    } finally {
      group.inFlight = false;
      if (group.dirty && groups?.get(key) === group)
        scheduleOrderQueryRefresh(cache, url, accountId, isCurrent);
    }
  }, delay);
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

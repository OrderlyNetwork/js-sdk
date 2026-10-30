/** Matches local announcement destinations without matching unrelated paths. */
export function isAnnouncementRoute(url: string) {
  return /^\/announcement(?:\/|[?#]|$)/.test(url);
}

/** Merge the live query only for local announcement details; target values win. */
export function mergeAnnouncementDetailQuery(
  url: string,
  isOfficial?: boolean,
) {
  if (!/^\/announcement\/[^/?#]+(?:[?#]|$)/.test(url)) return url;

  const hashIndex = url.indexOf("#");
  const hash = hashIndex < 0 ? "" : url.slice(hashIndex);
  const pathAndSearch = hashIndex < 0 ? url : url.slice(0, hashIndex);
  const queryIndex = pathAndSearch.indexOf("?");
  const path =
    queryIndex < 0 ? pathAndSearch : pathAndSearch.slice(0, queryIndex);
  const target = new URLSearchParams(
    queryIndex < 0 ? "" : pathAndSearch.slice(queryIndex + 1),
  );
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  // An ID link or slug without a source must not inherit an official source.
  params.delete("is_official");
  for (const key of new Set(target.keys())) params.delete(key);
  target.forEach((value, key) => params.append(key, value));
  if (typeof isOfficial === "boolean")
    params.set("is_official", String(isOfficial));
  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${hash}`;
}

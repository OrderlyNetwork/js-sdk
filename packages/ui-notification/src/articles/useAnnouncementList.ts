import { useCallback, useEffect } from "react";
import { useAnnouncementArticles } from "./context";
import { normalizeListQuery } from "./store";
import type { AnnouncementListQuery } from "./types";

/** Reads a server page, or an in-memory page supplied by a custom context. */
export function useAnnouncementList(
  query: AnnouncementListQuery = {},
  enabled = true,
) {
  const source = useAnnouncementArticles();
  const {
    category,
    page,
    size,
    source: sourceFilter,
  } = normalizeListQuery(query);
  const { watchList, retryList } = source;
  useEffect(() => {
    if (enabled)
      return watchList?.({ category, page, size, source: sourceFilter });
  }, [enabled, watchList, category, page, size, sourceFilter]);
  const retry = useCallback(() => {
    if (retryList) retryList({ category, page, size, source: sourceFilter });
    else source.retry();
  }, [retryList, source.retry, category, page, size, sourceFilter]);
  const filtered = source.getList
    ? []
    : source.articles.filter(
        (row) =>
          (category === "all" || row.category === category) &&
          (sourceFilter === "all" ||
            row.is_official === (sourceFilter === "official")),
      );
  const state = source.getList?.({
    category,
    page,
    size,
    source: sourceFilter,
  }) ?? {
    articles: filtered.slice((page - 1) * size, page * size),
    total: filtered.length,
    status: source.status,
  };
  return { ...state, retry };
}

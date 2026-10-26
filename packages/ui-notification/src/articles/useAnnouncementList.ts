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
  const { category, page, size } = normalizeListQuery(query);
  const { watchList, retryList } = source;
  useEffect(() => {
    if (enabled) return watchList?.({ category, page, size });
  }, [enabled, watchList, category, page, size]);
  const retry = useCallback(() => {
    if (retryList) retryList({ category, page, size });
    else source.retry();
  }, [retryList, source.retry, category, page, size]);
  const filtered = source.getList
    ? []
    : source.articles.filter(
        (row) => category === "all" || row.category === category,
      );
  const state = source.getList?.({ category, page, size }) ?? {
    articles: filtered.slice((page - 1) * size, page * size),
    total: filtered.length,
    status: source.status,
  };
  return { ...state, retry };
}

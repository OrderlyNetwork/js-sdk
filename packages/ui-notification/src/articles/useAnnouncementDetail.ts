import { useCallback, useEffect } from "react";
import { useAnnouncementArticles } from "./context";
import type { LocalizedArticle } from "./model";

export function useAnnouncementDetail(id?: string) {
  const { articles, getDetail, loadDetail, status, retry } =
    useAnnouncementArticles();
  const detail = id ? getDetail?.(id) : undefined;
  useEffect(() => {
    if (id && loadDetail) void loadDetail(id, true);
  }, [id, loadDetail]);
  useEffect(() => {
    if (id && loadDetail && detail?.status === "loading") void loadDetail(id);
  }, [id, loadDetail, detail?.status, getDetail]);
  const retryDetail = useCallback(() => {
    if (id && loadDetail) void loadDetail(id, true);
    else retry();
  }, [id, loadDetail, retry]);
  return {
    article: detail
      ? detail.article
      : (articles.find(
          (row) =>
            String(row.announcement_id) === id &&
            typeof row.content === "string",
        ) as LocalizedArticle | undefined),
    status: detail?.status ?? status,
    retry: retryDetail,
  };
}

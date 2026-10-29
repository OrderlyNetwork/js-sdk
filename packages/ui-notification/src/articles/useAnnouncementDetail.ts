import { useCallback, useEffect } from "react";
import { useAnnouncementArticles } from "./context";
import type { LocalizedArticle } from "./model";
import { findAnnouncementBySlug, isAnnouncementId } from "./routes";

/**
 * Reads a complete localized article from an ancestor provider or custom source.
 * @param target - Explicit slug or ID locator. String values use ID lookup for digits-only values
 * and slug lookup otherwise; host detail routes should use an explicit slug locator.
 * @param isOfficial - Slug source selector; defaults to false. Does not bypass global visibility.
 * @returns article, status and retry. A ready result without article means no visible match.
 */
export function useAnnouncementDetail(
  target?: string | { slug: string } | { id: string },
  isOfficial = false,
) {
  const {
    articles,
    getDetail,
    loadDetail,
    status,
    retry,
    getDetailBySlug,
    loadDetailBySlug,
  } = useAnnouncementArticles();
  const locator =
    typeof target === "string"
      ? isAnnouncementId(target)
        ? { id: target }
        : { slug: target }
      : target;
  const slug = locator && "slug" in locator ? locator.slug : undefined;
  const targetId = locator && "id" in locator ? locator.id : undefined;
  const directSlug = !!slug && !!getDetailBySlug && !!loadDetailBySlug;
  const customArticle =
    slug && !directSlug
      ? findAnnouncementBySlug(articles, slug, isOfficial)
      : undefined;
  const completeCustom =
    customArticle && typeof customArticle.content === "string"
      ? (customArticle as LocalizedArticle)
      : undefined;
  const id = slug
    ? customArticle
      ? String(customArticle.announcement_id)
      : undefined
    : targetId;
  const detail = directSlug
    ? getDetailBySlug!(slug!, isOfficial)
    : completeCustom
      ? { status, article: completeCustom }
      : id
        ? getDetail?.(id)
        : undefined;
  const load = useCallback(
    (force = false) => {
      if (directSlug) void loadDetailBySlug!(slug!, isOfficial, force);
      else if (id && loadDetail && !completeCustom) void loadDetail(id, force);
    },
    [
      directSlug,
      slug,
      isOfficial,
      loadDetailBySlug,
      id,
      loadDetail,
      completeCustom,
    ],
  );
  useEffect(() => {
    load(true);
  }, [load]);
  useEffect(() => {
    if (detail?.status === "loading") load();
  }, [load, detail?.status, getDetail, getDetailBySlug]);
  const retryDetail = useCallback(() => {
    if (directSlug || (id && loadDetail && !completeCustom)) load(true);
    else retry();
  }, [directSlug, id, loadDetail, completeCustom, load, retry]);
  const article = detail
    ? detail.article
    : (articles.find(
        (row) =>
          String(row.announcement_id) === id && typeof row.content === "string",
      ) as LocalizedArticle | undefined);
  return {
    article:
      article &&
      (!slug || (article.slug === slug && article.is_official === isOfficial))
        ? article
        : undefined,
    status: detail?.status ?? status,
    retry: retryDetail,
  };
}

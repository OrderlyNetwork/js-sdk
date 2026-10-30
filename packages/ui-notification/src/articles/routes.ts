type AnnouncementRouteTarget = {
  announcement_id: string | number;
  slug?: string;
  is_official?: boolean;
  url?: string | null;
};

export const isAnnouncementId = (value: string) => /^\d+$/.test(value);

/** Preserves explicit adapter URLs and falls back to IDs for legacy rows. */
export function announcementDetailUrl(
  article: AnnouncementRouteTarget,
  search = new URLSearchParams(),
) {
  if (article.url) return article.url;
  const params = new URLSearchParams(search);
  params.delete("is_official");
  const useSlug = !!article.slug && typeof article.is_official === "boolean";
  if (useSlug) params.set("is_official", String(article.is_official));
  const path = `/announcement/${encodeURIComponent(useSlug ? article.slug! : String(article.announcement_id))}`;
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/** Never chooses arbitrarily between duplicate slugs in the same source. */
export function findAnnouncementBySlug<T extends AnnouncementRouteTarget>(
  articles: T[],
  slug: string,
  isOfficial = false,
): T | undefined {
  const matches = articles.filter(
    (article) => article.slug === slug && article.is_official === isOfficial,
  );
  return matches.length === 1 ? matches[0] : undefined;
}

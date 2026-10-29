import type { AnnouncementSummary } from "../types";
import { announcementExcerpt } from "./markdown";
import { announcementDetailUrl } from "./routes";
import type {
  AnnouncementArticle,
  AnnouncementApiCategory,
  AnnouncementCategory,
  ContentLocale,
  AnnouncementListRow,
} from "./types";

/**
 * Complete article with a UI category and selected localized title/body.
 */
export type LocalizedArticle = Omit<AnnouncementArticle, "category"> & {
  /** Lowercase UI category, excluding all. */
  category: Exclude<AnnouncementCategory, "all">;
  /** Selected localized title. */
  title: string;
  /** Selected localized Markdown body. */
  content: string;
  /** Content language actually used after fallback. */
  contentLocale: ContentLocale;
};
const categoryFilters: Record<
  AnnouncementApiCategory,
  Exclude<AnnouncementCategory, "all">
> = {
  CAMPAIGN: "campaign",
  LISTINGS: "listing",
  DELISTINGS: "delisting",
  UPDATES: "update",
  LEGAL: "legal",
  OTHERS: "others",
};
/**
 * Public read state: loading, ready or error. Ready does not imply a visible detail exists.
 */
export type ReadStatus = "loading" | "ready" | "error";
/**
 * Sorts publication metadata without modifying the input.
 * @param articles - Rows with numeric IDs and publication timestamps in milliseconds.
 * @returns A new array sorted by published_time and then announcement_id, both descending.
 */
export function sortAnnouncements<
  T extends Pick<AnnouncementArticle, "published_time" | "announcement_id">,
>(articles: T[]): T[] {
  return [...articles].sort(
    (a, b) =>
      b.published_time - a.published_time ||
      b.announcement_id - a.announcement_id,
  );
}

/**
 * Localized list metadata; body content and source identity may be absent.
 */
export type LocalizedAnnouncement = Omit<
  LocalizedArticle,
  "translations" | "content" | "is_official"
> & {
  /** Title translations, without a guaranteed article body. */
  translations: AnnouncementListRow["translations"];
  /** Known source identity, when supplied. */
  is_official?: boolean;
  /** Complete localized body only when supplied by a custom/full source. */
  content?: string;
  /** Explicit custom destination, when supplied. */
  url?: string | null;
};

/**
 * Selects a localized title and converts the API category to a UI category.
 * @param row - Title-only list metadata with an English title.
 * @param locale - Supported base content locale; regional variants are not normalized here.
 * @returns Localized list metadata; a missing/blank title falls back to English.
 */
export function localizeAnnouncement(
  row: AnnouncementListRow,
  locale: string,
): LocalizedAnnouncement {
  const candidate = row.translations[locale as ContentLocale];
  const selected = candidate?.title.trim() ? (locale as ContentLocale) : "en";
  return {
    ...row,
    title: row.translations[selected]!.title,
    category: categoryFilters[row.category] ?? "others",
    contentLocale: selected,
  };
}
/**
 * Filters article source ownership and sorts by publication time. Does not read app configuration.
 * @param articles - Complete article metadata.
 * @param brokerId - Broker whose platform posts are allowed; absent means no platform posts.
 * @param includeOfficial - Include official posts; defaults to true for this helper only.
 * @returns A new sorted array of matching articles.
 */
export function visibleAnnouncements(
  articles: AnnouncementArticle[],
  brokerId?: string,
  includeOfficial = true,
) {
  return sortAnnouncements(
    articles.filter((item) =>
      item.is_official
        ? includeOfficial
        : !!brokerId && item.broker_id === brokerId,
    ),
  );
}
/**
 * Selects a complete localized article title/body and converts the category.
 * @param article - Article with complete English content.
 * @param locale - Supported base content locale; regional variants are not normalized here.
 * @returns Localized article; incomplete title/body translations fall back together to English.
 */
export function localizeArticle(
  article: AnnouncementArticle,
  locale: string,
): LocalizedArticle {
  const candidate = article.translations[locale as ContentLocale];
  const complete = !!candidate?.title.trim() && !!candidate?.content.trim();
  return {
    ...article,
    category: categoryFilters[article.category],
    ...(complete && candidate ? candidate : article.translations.en),
    contentLocale: complete ? (locale as ContentLocale) : "en",
  };
}
/**
 * Builds bell/card presentation metadata from a localized article or list row.
 * @param article - Localized metadata, optionally including content.
 * @returns A summary with a plain-text excerpt when content exists, otherwise an empty message.
 * Explicit URLs take priority; known slug/source metadata produces a source-scoped detail URL.
 */
export function toSummary(article: LocalizedAnnouncement): AnnouncementSummary {
  return {
    announcement_id: article.announcement_id,
    slug: article.slug,
    is_official: article.is_official,
    title: article.title,
    category: article.category,
    message: article.content ? announcementExcerpt(article.content) : "",
    published_time: article.published_time,
    updated_time: article.updated_time,
    notification_card_end_time: article.notification_card_end_time,
    url: announcementDetailUrl(article),
  };
}

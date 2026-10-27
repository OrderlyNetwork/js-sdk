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

export type LocalizedArticle = Omit<AnnouncementArticle, "category"> & {
  category: Exclude<AnnouncementCategory, "all">;
  title: string;
  content: string;
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
export type ReadStatus = "loading" | "ready" | "error";
export function sortAnnouncements<
  T extends Pick<AnnouncementArticle, "published_time" | "announcement_id">,
>(articles: T[]): T[] {
  return [...articles].sort(
    (a, b) =>
      b.published_time - a.published_time ||
      b.announcement_id - a.announcement_id,
  );
}

export type LocalizedAnnouncement = Omit<
  LocalizedArticle,
  "translations" | "content" | "is_official"
> & {
  translations: AnnouncementListRow["translations"];
  is_official?: boolean;
  content?: string;
  url?: string | null;
};

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

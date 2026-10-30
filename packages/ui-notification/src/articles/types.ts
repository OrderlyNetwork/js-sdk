import type { API } from "@orderly.network/types";

/**
 * Supported UI categories; "all" means no category filter.
 */
export const announcementCategories = [
  "all",
  "campaign",
  "listing",
  "delisting",
  "update",
  "legal",
  "others",
] as const;
/**
 * UI category union, including the unfiltered "all" option.
 */
export type AnnouncementCategory = (typeof announcementCategories)[number];
/**
 * Backend category values; convert to lowercase UI categories before rendering.
 */
export type AnnouncementApiCategory =
  | "CAMPAIGN"
  | "LISTINGS"
  | "DELISTINGS"
  | "UPDATES"
  | "LEGAL"
  | "OTHERS";
/**
 * Supported announcement content languages. Automatic reads normalize regional variants.
 */
export type ContentLocale = "en" | "zh" | "es" | "fr" | "ja" | "ko";
/**
 * Complete localized article title and Markdown body.
 */
export type AnnouncementTranslation = {
  /** Localized article title. */
  title: string;
  /** Localized article body in Markdown. */
  content: string;
};

/**
 * Complete public article body. English title/content is required; timestamps are milliseconds.
 */
export type AnnouncementArticle = {
  /** Backend announcement identity. */
  announcement_id: number;
  /** Backend-generated slug; may be absent on custom data. */
  slug?: string;
  /** Backend category, not a UI category. */
  category: AnnouncementApiCategory;
  /** True for Orderly posts; false for broker posts. */
  is_official: boolean;
  /** Owning broker for a platform announcement. */
  broker_id?: string;
  /** Publication timestamp in milliseconds. */
  published_time: number;
  /** Last content update timestamp in milliseconds. */
  updated_time: number;
  /** Card expiry timestamp in milliseconds. Null/absent means no configured deadline. */
  notification_card_end_time?: number | null;
  /** Complete English content plus optional supported translations. */
  translations: { en: AnnouncementTranslation } & Partial<
    Record<ContentLocale, AnnouncementTranslation>
  >;
};

/**
 * Title-only public list row. Use detail reads for a complete article body.
 */
export type AnnouncementListRow = Omit<
  AnnouncementArticle,
  "translations" | "is_official"
> & {
  /** Optional source identity for legacy/custom rows; do not infer it when absent. */
  is_official?: boolean;
  /** Legacy message fallback when translations are absent. */
  message?: string;
  /** Explicit destination URL, when supplied. */
  url?: string | null;
  /** Legacy announcement type. */
  type?: string | null;
  /** Legacy translated messages. */
  i18n?: Record<string, string | null>;
  /** English title plus optional localized titles; does not guarantee body content. */
  translations: { en: { title: string } } & Partial<
    Record<ContentLocale, { title: string }>
  >;
};

/**
 * List response data with required server pagination metadata, before UI localization.
 */
export type AnnouncementListResponse = {
  /** Rows for the requested server page. */
  rows: AnnouncementListRow[];
  /** Server total, current page and records per page; remains unchanged by client filtering. */
  meta: API.RecordsMeta;
  /** Latest publication update in this source scope, not just this page. */
  last_updated_time: number;
};

/**
 * Active-card response data with article bodies and no pagination metadata.
 */
export type AnnouncementActiveResponse = {
  /** Active articles with content for the requested locale and card deadlines. */
  rows: AnnouncementArticle[];
  /** Latest publication update in this source scope. */
  last_updated_time: number;
};

/**
 * List source filter; "community" selects platform posts. Cannot enable globally excluded posts.
 */
export type AnnouncementSourceFilter = "all" | "official" | "community";

/**
 * List selection and pagination options. Omitted values use the documented defaults.
 */
export type AnnouncementListQuery = {
  /**
   * Source subset within global visibility.
   * @default "all"
   */
  source?: AnnouncementSourceFilter;
  /**
   * UI category to request.
   * @default "all"
   */
  category?: AnnouncementCategory;
  /**
   * Positive integer page; invalid values use 1.
   * @default 1
   */
  page?: number;
  /**
   * Positive integer page size, capped at 100; invalid values use 20.
   * @default 20
   */
  size?: number;
};

/**
 * Source options for announcement composition. Not accepted as provider or public-hook props.
 */
export type AnnouncementSourceOptions = {
  /** Configured platform broker, when present. */
  brokerId?: string;
  /**
   * Exclude official posts.
   * @default false
   */
  excludeOfficial?: boolean;
};

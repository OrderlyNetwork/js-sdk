export const announcementCategories = [
  "all",
  "campaign",
  "listing",
  "delisting",
  "update",
  "legal",
  "others",
] as const;
export type AnnouncementCategory = (typeof announcementCategories)[number];
export type AnnouncementApiCategory =
  | "CAMPAIGN"
  | "LISTINGS"
  | "DELISTINGS"
  | "UPDATES"
  | "LEGAL"
  | "OTHERS";
export type ContentLocale = "en" | "zh" | "es" | "fr" | "ja" | "ko";
export type AnnouncementTranslation = { title: string; content: string };

/** Proposed v0.5 payload for the frontend prototype; not a deployed API contract. */
export type AnnouncementArticle = {
  announcement_id: number;
  category: AnnouncementApiCategory;
  is_official: boolean;
  broker_id?: string;
  published_time: number;
  updated_time: number;
  notification_card_end_time?: number | null;
  translations: { en: AnnouncementTranslation } & Partial<
    Record<ContentLocale, AnnouncementTranslation>
  >;
};

import type { API } from "@orderly.network/types";

/**
 * Bell/card presentation data. Inherits API.AnnouncementRow except its API category;
 * requires announcement_id and message. Optional title/category enable article-style presentation.
 */
export type AnnouncementSummary = Omit<API.AnnouncementRow, "category"> & {
  /** Localized title; absent legacy rows use message/type presentation. */
  title?: string;
  /** Known source identity; absent values must not be labeled as official/platform-owned. */
  is_official?: boolean;
  /** Publication timestamp in milliseconds. */
  published_time?: number;
  /** Card expiry in milliseconds; null/absent retains custom cards. */
  notification_card_end_time?: number | null;
  /** Maintenance window start in milliseconds. */
  startTime?: number;
  /** Maintenance window end in milliseconds. */
  endTime?: number;
  /** Lowercase UI category, not the uppercase API category. */
  category?:
    | "campaign"
    | "listing"
    | "delisting"
    | "update"
    | "legal"
    | "others";
};

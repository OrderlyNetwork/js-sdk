import type { API } from "@orderly.network/types";

/** Localized metadata used by the bell and card carousel. */
export type AnnouncementSummary = Omit<API.AnnouncementRow, "category"> & {
  title?: string;
  is_official?: boolean;
  published_time?: number;
  notification_card_end_time?: number | null;
  startTime?: number;
  endTime?: number;
  category?:
    | "campaign"
    | "listing"
    | "delisting"
    | "update"
    | "legal"
    | "others";
};

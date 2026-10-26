import type { API } from "@orderly.network/types";

/** Frontend announcement metadata; the public API schema is unchanged. */
export type AnnouncementSummary = API.AnnouncementRow & {
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

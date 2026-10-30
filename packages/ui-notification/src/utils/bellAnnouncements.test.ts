import { describe, expect, it } from "vitest";
import type { AnnouncementSummary } from "../types";
import { mergeBellAnnouncements } from "./bellAnnouncements";

const announcement = (
  announcement_id: string | number,
  updated_time?: number,
): AnnouncementSummary => ({ announcement_id, updated_time, message: "Body" });

describe("bell announcement merging", () => {
  it("sorts by update time rather than publication time without mutating inputs", () => {
    const older = { ...announcement(1, 10), published_time: 100 };
    const newer = { ...announcement(2, 30), published_time: 1 };
    const maintenance = { ...announcement("-1", 20), startTime: 20 };
    const ordinary = [older, newer];
    expect(mergeBellAnnouncements(ordinary, [maintenance])).toEqual([
      newer,
      maintenance,
      older,
    ]);
    expect(ordinary).toEqual([older, newer]);
  });

  it("places maintenance first on ties and preserves ordinary tie ordering", () => {
    const ordinary = [announcement(2, 10), announcement(1, 10)];
    const maintenance = announcement("-1", 10);
    expect(mergeBellAnnouncements(ordinary, [maintenance])).toEqual([
      maintenance,
      ...ordinary,
    ]);
  });

  it("deduplicates numeric and string IDs and prefers the maintenance source", () => {
    const maintenance = announcement("-1", 10);
    const ordinary = announcement(1, 20);
    expect(
      mergeBellAnnouncements(
        [announcement(-1, 30), ordinary, announcement("1", 40)],
        [maintenance],
      ),
    ).toEqual([ordinary, maintenance]);
  });

  it("retains expired cards in reading lists and treats missing times as zero", () => {
    const missing = announcement(1);
    const expired = {
      ...announcement(2, 10),
      notification_card_end_time: 1,
    };
    const maintenance = announcement("-1");
    expect(mergeBellAnnouncements([missing, expired], [maintenance])).toEqual([
      expired,
      maintenance,
      missing,
    ]);
    expect(mergeBellAnnouncements([], [])).toEqual([]);
  });
});

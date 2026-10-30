import { describe, expect, it } from "vitest";
import type { AnnouncementSummary } from "@orderly.network/ui-notification";
import { selectMessages } from "./selectMessages";

const ordinary: AnnouncementSummary[] = Array.from({ length: 8 }, (_, i) => ({
  announcement_id: i + 1,
  updated_time: 100 - i,
  message: `Announcement ${i + 1}`,
}));

describe("bell maintenance slot", () => {
  it.each([1, 5, 6, 9])(
    "keeps maintenance within five entries when its natural position is %i",
    (position) => {
      const maintenance: AnnouncementSummary = {
        announcement_id: "-1",
        updated_time: 101.5 - position,
        message: "Maintenance",
      };
      const messages = [...ordinary];
      messages.splice(position - 1, 0, maintenance);
      const original = [...messages];
      const visible = selectMessages(messages);
      expect(visible).toEqual(
        position <= 5
          ? messages.slice(0, 5)
          : [...ordinary.slice(0, 4), maintenance],
      );
      expect(visible).toHaveLength(5);
      expect(messages).toEqual(original);
    },
  );

  it("keeps the latest five ordinary announcements when there is no maintenance", () => {
    expect(selectMessages(ordinary)).toEqual(ordinary.slice(0, 5));
  });

  it("handles empty, maintenance-only and short lists, including numeric maintenance IDs", () => {
    const maintenance: AnnouncementSummary = {
      announcement_id: -1,
      message: "Maintenance",
    };
    expect(selectMessages([])).toEqual([]);
    expect(selectMessages([maintenance])).toEqual([maintenance]);
    expect(selectMessages([ordinary[0], maintenance])).toEqual([
      ordinary[0],
      maintenance,
    ]);
    expect(selectMessages([...ordinary, maintenance])).toEqual([
      ...ordinary.slice(0, 4),
      maintenance,
    ]);
  });
});

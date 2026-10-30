import type { AnnouncementSummary } from "../types";

export const isSystemMaintenance = (tip: AnnouncementSummary) =>
  String(tip.announcement_id) === "-1";

/** Bell reads retain expired cards and prefer the current system maintenance. */
export function mergeBellAnnouncements(
  announcements: AnnouncementSummary[],
  maintenance: AnnouncementSummary[],
) {
  const seen = new Set<string>();
  return [...maintenance, ...announcements]
    .filter((tip) => {
      const id = String(tip.announcement_id);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort(
      (a, b) =>
        (b.updated_time ?? 0) - (a.updated_time ?? 0) ||
        Number(isSystemMaintenance(b)) - Number(isSystemMaintenance(a)),
    );
}

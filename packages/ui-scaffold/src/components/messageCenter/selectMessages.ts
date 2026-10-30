import type { AnnouncementSummary } from "@orderly.network/ui-notification";

/** Reserve a bell slot for system maintenance without changing the sorted input. */
export function selectMessages(messages: AnnouncementSummary[]) {
  const visible = messages.slice(0, 5);
  const maintenanceIndex = messages.findIndex(
    (item) => String(item.announcement_id) === "-1",
  );
  if (maintenanceIndex >= 5) visible[4] = messages[maintenanceIndex];
  return visible;
}

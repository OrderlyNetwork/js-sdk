/** Format a maintenance window in UTC without implying an update timestamp. */
export function formatMaintenanceTime(startTime?: number, endTime?: number) {
  if (
    typeof startTime !== "number" ||
    typeof endTime !== "number" ||
    endTime < startTime
  ) {
    return null;
  }
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const startString = start.toISOString();
  const endString = end.toISOString();
  const sameDay = startString.slice(0, 10) === endString.slice(0, 10);
  const startLabel = startString.slice(0, 16).replace("T", " ");
  const endLabel = sameDay
    ? endString.slice(11, 16)
    : endString.slice(0, 16).replace("T", " ");

  return `${startLabel} – ${endLabel} UTC`;
}

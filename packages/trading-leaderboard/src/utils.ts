import { format, subDays } from "date-fns";

export const getDateRange = (offsetDay: number) => {
  return {
    from: subDays(new Date(), offsetDay - 1)!,
    to: new Date()!,
  };
};

/**
 * Format a date to "yyyy-MM-dd" format (e.g., "2025-03-10")
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDateRange = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

export function formatCampaignDate(date: Date | string): string {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  if (typeof date === "string") {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate();
  return `${month} ${day}, ${year}`;
}

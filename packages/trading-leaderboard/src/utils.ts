import {
  format,
  subDays,
  addDays,
  isBefore,
  isAfter,
  isWithinInterval,
} from "date-fns";

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

function getUTCDateInfo(date: Date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return { year, month, day, hours, minutes };
}

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
  const { year, month, day, hours, minutes } = getUTCDateInfo(date);
  return `${monthNames[month]} ${day}, ${year} ${hours}:${minutes}`;
}

export function formatUpdateDate(timestamp: number) {
  const time = new Date(timestamp);
  try {
    return format(time, "yyyy-MM-dd HH:mm");
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
}

export type WeeklyDateRange = {
  from: Date;
  to: Date;
  label: string;
};

/**
 * Split campaign date range into weekly periods and add an "All time" option
 * @param campaignDateRange Object containing start_time and end_time
 * @returns Array of date ranges with weekly splits plus "All time" option
 */
export function splitCampaignByWeeks(campaignDateRange: {
  start_time: Date | string;
  end_time: Date | string;
}): WeeklyDateRange[] {
  const startDate =
    typeof campaignDateRange.start_time === "string"
      ? new Date(campaignDateRange.start_time)
      : campaignDateRange.start_time;

  const endDate =
    typeof campaignDateRange.end_time === "string"
      ? new Date(campaignDateRange.end_time)
      : campaignDateRange.end_time;

  const result: WeeklyDateRange[] = [];
  let currentWeekStart = new Date(startDate);
  let weekNumber = 1;

  while (
    isBefore(currentWeekStart, endDate) ||
    currentWeekStart.getTime() === endDate.getTime()
  ) {
    // Calculate the end of current week (6 days after start)
    const currentWeekEnd = addDays(currentWeekStart, 6);

    // If this week extends beyond the campaign end date, use the campaign end date
    const actualWeekEnd = isAfter(currentWeekEnd, endDate)
      ? endDate
      : currentWeekEnd;

    result.push({
      from: new Date(currentWeekStart),
      to: actualWeekEnd,
      label: `Week ${weekNumber}`,
    });

    // Move to next week
    currentWeekStart = addDays(currentWeekEnd, 1);
    weekNumber++;

    // Safety check to prevent infinite loop
    if (weekNumber > 100) {
      console.warn(
        "Too many weeks detected, breaking loop to prevent infinite iteration",
      );
      break;
    }
  }

  // Add "All time" option covering the entire campaign period
  // result.push({
  //   from: new Date(startDate),
  //   to: new Date(endDate),
  //   label: "All time",
  // });

  return result;
}

/**
 * Find the current weekly range that contains the given date (or current time)
 * @param weeklyRanges Array of weekly date ranges
 * @param targetDate The date to check (defaults to current time)
 * @returns The weekly range that contains the target date, or null if not found
 */
export function getCurrentWeeklyRange(
  weeklyRanges: WeeklyDateRange[],
  targetDate: Date = new Date(),
): WeeklyDateRange | null {
  // Exclude "All time" range from the search since it's not a specific weekly period
  const weeklyOnlyRanges = weeklyRanges.filter(
    (range) => range.label !== "All time",
  );

  for (const range of weeklyOnlyRanges) {
    if (isWithinInterval(targetDate, { start: range.from, end: range.to })) {
      return range;
    }
  }

  return null;
}

/**
 * Get the current active weekly range or fallback to "All time"
 * @param weeklyRanges Array of weekly date ranges
 * @param targetDate The date to check (defaults to current time)
 * @returns The current weekly range or "All time" range as fallback
 */
export function getCurrentOrAllTimeRange(
  weeklyRanges: WeeklyDateRange[],
  targetDate: Date = new Date(),
): WeeklyDateRange | undefined {
  // First try to find current weekly range
  const currentWeekly = getCurrentWeeklyRange(weeklyRanges, targetDate);
  if (currentWeekly) {
    return currentWeekly;
  }

  // If not in any weekly range, return "All time" range
  return (
    weeklyRanges.find((range) => range.label === "All time") ||
    weeklyRanges[weeklyRanges.length - 1]
  );
}

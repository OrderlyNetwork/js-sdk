import { format } from "date-fns";
import { TimelinePoint } from "./components/axis";
import { CampaignConfig, CampaignTagEnum, CampaignStatistics } from "./type";

/**
 * Get the appropriate tag for a campaign based on its configuration and current conditions
 * @param campaign Campaign configuration object
 * @param userReferralCode User's referral code (optional)
 * @returns CampaignTagEnum representing the current status of the campaign
 */
export const getCampaignTag = (
  campaign: CampaignConfig,
  userReferralCode?: string,
): CampaignTagEnum => {
  const currentTime = new Date();
  const startTime = new Date(campaign.start_time);
  const endTime = new Date(campaign.end_time);

  // Check if campaign is exclusive to specific referral codes
  if (campaign.referral_codes && campaign.referral_codes.length > 0) {
    // If user doesn't have a referral code or it's not in the allowed list
    if (
      !userReferralCode ||
      !campaign.referral_codes.includes(userReferralCode)
    ) {
      // Don't show the campaign at all, or return a special status
      // For now, we'll treat it as if the campaign doesn't exist for this user
      // You might want to handle this differently based on your UI requirements
      return CampaignTagEnum.EXCLUSIVE;
    }

    // If user has valid referral code, check the time-based status
    if (currentTime < startTime) {
      return CampaignTagEnum.COMING;
    } else if (currentTime > endTime) {
      return CampaignTagEnum.ENDED;
    } else {
      return CampaignTagEnum.EXCLUSIVE; // Show as exclusive during the active period
    }
  }

  // For non-exclusive campaigns, check time-based status
  if (currentTime < startTime) {
    return CampaignTagEnum.COMING;
  } else if (currentTime > endTime) {
    return CampaignTagEnum.ENDED;
  } else {
    return CampaignTagEnum.ONGOING;
  }
};

/**
 * Check if a campaign is visible to the current user
 * @param campaign Campaign configuration object
 * @param userReferralCode User's referral code (optional)
 * @returns boolean indicating if the campaign should be displayed
 */
export const isCampaignVisible = (
  campaign: CampaignConfig,
  userReferralCode?: string,
): boolean => {
  // If campaign has referral code restrictions
  if (campaign.referral_codes && campaign.referral_codes.length > 0) {
    // Only show if user has a valid referral code
    return (
      !!userReferralCode && campaign.referral_codes.includes(userReferralCode)
    );
  }

  // For non-exclusive campaigns, always visible
  return true;
};

/**
 * Format campaign date range to display format like "Feb 28, 2025 - March 2, 2025 UTC"
 * @param startTime Start time string or timestamp
 * @param endTime End time string or timestamp
 * @returns Formatted date range string with UTC suffix
 */
export const formatCampaignDateRange = (
  startTime: string | number | Date,
  endTime: string | number | Date,
): string => {
  try {
    // Convert to Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn("Invalid date value provided to formatCampaignDateRange:", {
        startTime,
        endTime,
      });
      return "Invalid date range";
    }

    // Format dates using date-fns
    // MMM d, yyyy format gives us "Feb 28, 2025" style
    // Assuming the input timestamps are already in UTC
    const startFormatted = format(startDate, "MMM d, yyyy");
    const endFormatted = format(endDate, "MMM d, yyyy");

    return `${startFormatted} - ${endFormatted} UTC`;
  } catch (error) {
    console.error("Error formatting campaign date range:", error, {
      startTime,
      endTime,
    });
    return "Date formatting error";
  }
};

/**
 * Get total participants count from campaign statistics
 * @param statistics Campaign statistics data from API
 * @returns Formatted participants count
 */
export const getParticipantsCount = (
  statistics?: CampaignStatistics,
): number => {
  return statistics?.total_participants || 0;
};

/**
 * Get total trading volume from campaign statistics
 * @param statistics Campaign statistics data from API
 * @returns Total trading volume amount
 */
export const getTradingVolume = (statistics?: CampaignStatistics): number => {
  return statistics?.total_volume || 0;
};

/**
 * Calculate total prize pool amount from campaign configuration
 * @param campaign Campaign configuration object
 * @returns Object with total amount and currency, or null if no prize pools
 */
export const getTotalPrizePool = (
  campaign?: CampaignConfig,
): { amount: number; currency: string } | null => {
  if (!campaign?.prize_pools || campaign.prize_pools.length === 0) {
    return null;
  }

  // Group by currency and sum up the amounts
  const currencyTotals: Record<string, number> = {};

  campaign.prize_pools.forEach((pool) => {
    currencyTotals[pool.currency] =
      (currencyTotals[pool.currency] || 0) + pool.total_prize;
  });

  // For now, return the first currency found (typically USDC)
  // In the future, we might want to handle multiple currencies differently
  const currencies = Object.keys(currencyTotals);
  if (currencies.length === 0) return null;

  const mainCurrency = currencies[0];
  return {
    amount: currencyTotals[mainCurrency],
    currency: mainCurrency,
  };
};

/**
 * Get ticket prize pool amount from campaign configuration
 * @param campaign Campaign configuration object
 * @returns Object with amount and currency, or null if no ticket rules
 */
export const getTicketPrizePool = (
  campaign?: CampaignConfig,
): { amount: number; currency: string } | null => {
  if (!campaign?.ticket_rules) {
    return null;
  }

  return {
    amount: campaign.ticket_rules.total_prize,
    currency: campaign.ticket_rules.currency,
  };
};

/**
 * Format prize amount for display
 * @param amount Prize amount
 * @param currency Currency symbol
 * @returns Formatted string like "15,000 USDC"
 */
export const formatPrizeAmount = (amount: number, currency: string): string => {
  return `${amount.toLocaleString()} ${currency}`;
};

/**
 * Format trading volume for display with currency symbol
 * @param volume Trading volume amount
 * @returns Formatted string with $ prefix
 */
export const formatTradingVolume = (volume: number): string => {
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(1)}M`;
  } else if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(1)}K`;
  } else {
    return `$${volume.toFixed(0)}`;
  }
};

/**
 * Format participants count for display
 * @param count Participants count
 * @returns Formatted string with proper formatting
 */
export const formatParticipantsCount = (count: number): string => {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  } else if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  } else {
    return count.toLocaleString();
  }
};

/**
 * Generate timeline data points for campaign visualization
 * @param campaign Campaign configuration object
 * @returns Array of TimelinePoint objects (max 4 points)
 */
export const generateCampaignTimeline = (
  campaign: CampaignConfig,
): TimelinePoint[] => {
  const currentTime = new Date();
  const startTime = new Date(campaign.start_time);
  const endTime = new Date(campaign.end_time);
  const rewardTime = campaign.reward_distribution_time
    ? new Date(campaign.reward_distribution_time)
    : null;

  const timeline: TimelinePoint[] = [];

  // Helper function to determine point type based on time
  const getTimelineType = (
    time: Date,
    isNow: boolean = false,
  ): "past" | "active" | "future" => {
    if (isNow) return "active";
    return currentTime >= time ? "past" : "future";
  };

  // Helper function to format time for display
  const formatTimeDisplay = (time: Date): string => {
    try {
      return format(time, "yyyy-MM-dd HH:mm 'UTC'");
    } catch (error) {
      console.error("Error formatting time:", error);
      return time.toISOString();
    }
  };

  // Battle starts point
  timeline.push({
    title: "Battle starts",
    type: getTimelineType(startTime),
    time: formatTimeDisplay(startTime),
  });

  // Add "Now" point if battle is ongoing
  const isOngoing = currentTime >= startTime && currentTime <= endTime;
  if (isOngoing) {
    timeline.push({
      title: "Now",
      type: "active",
      time: formatTimeDisplay(currentTime),
    });
  }

  // Battle ends point
  timeline.push({
    title: "Battle ends",
    type: getTimelineType(endTime),
    time: formatTimeDisplay(endTime),
  });

  // Reward distribution point (if provided)
  if (rewardTime) {
    timeline.push({
      title: "Reward distribution",
      type: getTimelineType(rewardTime),
      time: formatTimeDisplay(rewardTime),
    });
  }

  // Ensure we don't exceed 4 points
  return timeline.slice(0, 4);
};

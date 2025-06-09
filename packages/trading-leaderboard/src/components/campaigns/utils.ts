import { format } from "date-fns";
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
 * Create sample campaign data for testing and demonstration
 * This function shows how the 4 numbers in the UI are derived
 */
export const createSampleCampaignData = () => {
  // Sample campaign configuration
  const sampleCampaign: CampaignConfig = {
    campaign_id: "spring-2024-trading",
    title: "Spring Trading Competition 2024",
    description: "Compete for amazing prizes based on your trading performance",
    start_time: "2024-03-01T00:00:00Z",
    end_time: "2024-03-31T23:59:59Z",
    image: "/campaigns/spring-2024.jpg",
    prize_pools: [
      {
        pool_id: "general",
        label: "General Pool",
        total_prize: 15000,
        currency: "USDC",
        metric: "volume",
        tiers: [
          { position: 1, amount: 5000 },
          { position: 2, amount: 3000 },
          { position: 3, amount: 2000 },
          { position_range: [4, 10], amount: 500 },
        ],
      },
    ],
    ticket_rules: {
      total_prize: 2000,
      currency: "USDC",
      metric: "volume",
      mode: "tiered",
      tiers: [
        { value: 50000, tickets: 10 },
        { value: 25000, tickets: 5 },
        { value: 10000, tickets: 1 },
      ],
    },
  };

  // Sample campaign statistics (from API)
  const sampleStatistics: CampaignStatistics = {
    total_participants: 10000, // Number 1: Participants count
    total_volume: 323232, // Number 2: Trading volume
    total_pnl: 145000,
  };

  // Demonstrate how the 4 numbers are calculated:
  console.log("=== Campaign Data Analysis ===");
  console.log("1. Participants:", getParticipantsCount(sampleStatistics)); // 10000 -> "10K"
  console.log("2. Trading Volume:", getTradingVolume(sampleStatistics)); // 323232
  console.log("3. Prize Pool:", getTotalPrizePool(sampleCampaign)); // { amount: 15000, currency: "USDC" }
  console.log("4. Ticket Prize Pool:", getTicketPrizePool(sampleCampaign)); // { amount: 2000, currency: "USDC" }

  return {
    campaign: sampleCampaign,
    statistics: sampleStatistics,
  };
};

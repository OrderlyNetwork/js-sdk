import {
  TicketTierRule,
  TicketLinearRule,
  TicketRules,
  CampaignConfig,
  UserData,
  PrizePool,
} from "../campaigns/type";

/**
 * Calculate estimated rewards based on user's current performance and campaign configuration
 * @param userdata User's current trading data
 * @param campaign Campaign configuration
 * @returns Estimated reward amount with currency
 */
export function calculateEstimatedRewards(
  userdata: UserData,
  campaign: CampaignConfig,
): { amount: number; currency: string } | null {
  if (!campaign.prize_pools || campaign.prize_pools.length === 0) {
    return null;
  }

  let totalEstimatedReward = 0;
  const mainCurrency = campaign.prize_pools[0].currency;

  for (const pool of campaign.prize_pools) {
    const userMetricValue =
      pool.metric === "volume" ? userdata.volume : userdata.pnl;

    // Skip if user has no relevant data
    if (userMetricValue <= 0) continue;

    const estimatedRank = estimateUserRank(userdata, campaign, pool.metric);
    if (estimatedRank === null) continue;

    // Find matching tier based on estimated rank
    for (const tier of pool.tiers) {
      let isInTier = false;

      if (tier.position && estimatedRank === tier.position) {
        isInTier = true;
      } else if (tier.position_range) {
        const [start, end] = tier.position_range;
        if (estimatedRank >= start && estimatedRank <= end) {
          isInTier = true;
        }
      }

      if (isInTier) {
        totalEstimatedReward += tier.amount;
        break;
      }
    }
  }

  return totalEstimatedReward > 0
    ? { amount: totalEstimatedReward, currency: mainCurrency }
    : null;
}

/**
 * Calculate estimated tickets earned based on user's trading performance
 * @param userdata User's current trading data
 * @param ticketRules Ticket configuration rules
 * @returns Estimated number of tickets
 */
export function calculateEstimatedTickets(
  userdata: UserData,
  ticketRules: TicketRules,
): number {
  const userMetricValue =
    ticketRules.metric === "volume" ? userdata.volume : userdata.pnl;

  if (userMetricValue <= 0) return 0;

  if (ticketRules.mode === "tiered") {
    return calculateTieredTickets(userMetricValue, ticketRules.tiers || []);
  } else if (ticketRules.mode === "linear") {
    return calculateLinearTickets(userMetricValue, ticketRules.linear);
  }

  return 0;
}

/**
 * Calculate tickets using tiered mode
 * ≥ 25,000 volume → 10 tickets
 * ≥ 10,000 and < 25,000 → 5 tickets
 * ≥ 5,000 and < 10,000 → 1 ticket
 * < 5,000 → 0 tickets
 */
function calculateTieredTickets(
  metricValue: number,
  tiers: TicketTierRule[],
): number {
  // Sort tiers by value in descending order
  const sortedTiers = [...tiers].sort((a, b) => b.value - a.value);

  for (const tier of sortedTiers) {
    if (metricValue >= tier.value) {
      return tier.tickets;
    }
  }

  return 0;
}

/**
 * Calculate tickets using linear mode
 * Get X ticket for every Y volume/pnl
 */
function calculateLinearTickets(
  metricValue: number,
  linearRule?: TicketLinearRule,
): number {
  if (!linearRule) return 0;

  const multiplier = Math.floor(metricValue / linearRule.every);
  return multiplier * linearRule.tickets;
}

/**
 * Estimate user's rank based on current performance
 * This is a simplified estimation - in practice you might want to fetch actual ranking data
 */
function estimateUserRank(
  userdata: UserData,
  campaign: CampaignConfig,
  metric: "volume" | "pnl",
): number | null {
  // If we have actual rank data, use it
  if (userdata.rank) {
    return Number(userdata.rank);
  }

  // Otherwise, make a simple estimation based on performance
  // This is a placeholder logic - real implementation should consider actual leaderboard data
  const userMetricValue = metric === "volume" ? userdata.volume : userdata.pnl;
  const totalParticipants = userdata.total_participants || 1000;

  if (userMetricValue <= 0) return null;

  // Simple heuristic: assume better performance means better rank
  // In reality, you would compare against actual leaderboard data
  if (userMetricValue >= 100000) return 1;
  if (userMetricValue >= 50000) return Math.floor(totalParticipants * 0.05); // Top 5%
  if (userMetricValue >= 10000) return Math.floor(totalParticipants * 0.2); // Top 20%
  if (userMetricValue >= 1000) return Math.floor(totalParticipants * 0.5); // Top 50%

  return Math.floor(totalParticipants * 0.8); // Bottom 80%
}

/**
 * Format reward amount with currency for display
 */
export function formatRewardAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}

/**
 * Format ticket count for display
 */
export function formatTicketCount(tickets: number): string {
  return tickets.toLocaleString();
}

/**
 * Calculate user's estimated reward for a specific prize pool
 * @param userdata User's current trading data
 * @param pool Specific prize pool
 * @returns Estimated reward amount for this pool, or 0 if not eligible
 */
export function calculateUserPoolReward(
  userdata: UserData,
  pool: PrizePool,
): number {
  const userMetricValue =
    pool.metric === "volume" ? userdata.volume : userdata.pnl;

  // Skip if user has no relevant data
  if (userMetricValue <= 0) return 0;

  const estimatedRank = estimateUserRankForPool(userdata, pool.metric);
  if (estimatedRank === null) return 0;

  // Find matching tier based on estimated rank
  for (const tier of pool.tiers) {
    let isInTier = false;

    if (tier.position && estimatedRank === tier.position) {
      isInTier = true;
    } else if (tier.position_range) {
      const [start, end] = tier.position_range;
      if (estimatedRank >= start && estimatedRank <= end) {
        isInTier = true;
      }
    }

    if (isInTier) {
      return tier.amount;
    }
  }

  return 0;
}

/**
 * Estimate user's rank for a specific pool metric
 * Simplified version without campaign dependency
 */
function estimateUserRankForPool(
  userdata: UserData,
  metric: "volume" | "pnl",
): number | null {
  // If we have actual rank data, use it
  if (userdata.rank) {
    return Number(userdata.rank);
  }

  // Otherwise, make a simple estimation based on performance
  const userMetricValue = metric === "volume" ? userdata.volume : userdata.pnl;
  const totalParticipants = userdata.total_participants || 1000;

  if (userMetricValue <= 0) return null;

  // Simple heuristic: assume better performance means better rank
  if (userMetricValue >= 100000) return 1;
  if (userMetricValue >= 50000) return Math.floor(totalParticipants * 0.05); // Top 5%
  if (userMetricValue >= 10000) return Math.floor(totalParticipants * 0.2); // Top 20%
  if (userMetricValue >= 1000) return Math.floor(totalParticipants * 0.5); // Top 50%

  return Math.floor(totalParticipants * 0.8); // Bottom 80%
}

// Example usage of rewards calculation functions
import {
  calculateEstimatedRewards,
  calculateEstimatedTickets,
  CampaignConfig,
  UserData,
  formatRewardAmount,
  formatTicketCount,
} from "./utils";

// Example campaign configuration
const exampleCampaign: CampaignConfig = {
  campaign_id: "trading-competition-2024",
  title: "Spring Trading Competition",
  description: "Compete for prizes based on trading volume and PnL",
  start_time: "2024-03-01T00:00:00Z",
  end_time: "2024-03-31T23:59:59Z",
  reward_distribution_time: "2024-04-05T00:00:00Z",
  referral_codes: ["SPRING2024", "TRADER"],

  // Prize pools configuration
  prize_pools: [
    {
      pool_id: "general",
      label: "General Pool",
      total_prize: 10000,
      currency: "USDC",
      metric: "volume",
      tiers: [
        { position: 1, amount: 3000 },
        { position: 2, amount: 2000 },
        { position: 3, amount: 1000 },
        { position_range: [4, 10], amount: 500 },
        { position_range: [11, 50], amount: 100 },
      ],
    },
    {
      pool_id: "pnl",
      label: "PnL Pool",
      total_prize: 5000,
      currency: "USDC",
      metric: "pnl",
      tiers: [
        { position: 1, amount: 2000 },
        { position: 2, amount: 1500 },
        { position: 3, amount: 1000 },
        { position_range: [4, 20], amount: 250 },
      ],
    },
  ],

  // Ticket rules configuration (tiered mode)
  ticket_rules: {
    total_prize: 2000,
    currency: "WIF",
    metric: "volume",
    mode: "tiered",
    tiers: [
      { value: 25000, tickets: 10 },
      { value: 10000, tickets: 5 },
      { value: 5000, tickets: 1 },
    ],
  },
};

// Example linear ticket configuration
const linearTicketCampaign: CampaignConfig = {
  ...exampleCampaign,
  campaign_id: "linear-ticket-campaign",
  ticket_rules: {
    total_prize: 1000,
    currency: "WIF",
    metric: "volume",
    mode: "linear",
    linear: {
      every: 5000, // Every 5000 volume
      tickets: 1, // Earn 1 ticket
    },
  },
};

// Example user data scenarios
const scenarios = [
  {
    name: "High Volume Trader",
    userdata: {
      account_id: "user_001",
      current_rank: 5,
      trading_volume: 85000,
      pnl: 2500,
      total_participants: 1000,
    },
  },
  {
    name: "Medium Volume Trader",
    userdata: {
      account_id: "user_002",
      trading_volume: 15000,
      pnl: 800,
      total_participants: 1000,
    },
  },
  {
    name: "New Trader",
    userdata: {
      account_id: "user_003",
      trading_volume: 3000,
      pnl: -200,
      total_participants: 1000,
    },
  },
];

// Function to run examples and log results
export function runRewardsCalculationExamples() {
  console.log("=== Rewards Calculation Examples ===\n");

  scenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);
    console.log(
      `   Trading Volume: $${scenario.userdata.trading_volume.toLocaleString()}`,
    );
    console.log(`   PnL: $${scenario.userdata.pnl.toLocaleString()}`);

    // Calculate estimated rewards
    const estimatedRewards = calculateEstimatedRewards(
      scenario.userdata,
      exampleCampaign,
    );
    if (estimatedRewards) {
      console.log(
        `   Estimated Rewards: ${formatRewardAmount(estimatedRewards.amount, estimatedRewards.currency)}`,
      );
    } else {
      console.log(`   Estimated Rewards: No rewards expected`);
    }

    // Calculate estimated tickets (tiered mode)
    if (exampleCampaign.ticket_rules) {
      const estimatedTickets = calculateEstimatedTickets(
        scenario.userdata,
        exampleCampaign.ticket_rules,
      );
      console.log(
        `   Estimated Tickets (Tiered): ${formatTicketCount(estimatedTickets)}`,
      );
    }

    // Calculate estimated tickets (linear mode)
    if (linearTicketCampaign.ticket_rules) {
      const linearTickets = calculateEstimatedTickets(
        scenario.userdata,
        linearTicketCampaign.ticket_rules,
      );
      console.log(
        `   Estimated Tickets (Linear): ${formatTicketCount(linearTickets)}`,
      );
    }

    console.log("");
  });
}

// Example of how to use in React component
export function getRewardsDisplayData(
  userdata: UserData,
  campaign: CampaignConfig,
) {
  const estimatedRewards = calculateEstimatedRewards(userdata, campaign);
  const estimatedTickets = campaign.ticket_rules
    ? calculateEstimatedTickets(userdata, campaign.ticket_rules)
    : 0;

  return {
    rewards: {
      display: estimatedRewards
        ? formatRewardAmount(estimatedRewards.amount, estimatedRewards.currency)
        : "0 USDC",
      raw: estimatedRewards,
    },
    tickets: {
      display: formatTicketCount(estimatedTickets),
      raw: estimatedTickets,
    },
    hasTickets: Boolean(campaign.ticket_rules),
  };
}

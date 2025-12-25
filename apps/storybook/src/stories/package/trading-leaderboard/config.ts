import { CampaignConfig } from "@orderly.network/trading-leaderboard";
import { campaignRuleMap } from "./rules/constants";

export function getCampaigns() {
  return [
    {
      campaign_id: "120",
      title: "RECRUIT & REIGN",
      description: "Invite & trade to win",
      image: "/leaderboard/campaign_120.png",
      start_time: new Date("2025-08-07T10:00:00Z").toISOString(),
      end_time: new Date("2025-08-17T23:59:59Z").toISOString(),
      hide_arena: true,
      hide_rewards: true,
      prize_pools: [
        {
          pool_id: "invite_win",
          label: "Invite to win",
          total_prize: 2250,
          currency: "USDC",
          metric: "volume",
        },
        {
          pool_id: "welcome_bonus",
          label: "Welcome bonus",
          total_prize: 3750,
          currency: "USDC",
          metric: "volume",
          tiers: [
            {
              position_range: [1, 150],
              amount: 25,
            },
          ],
        },
      ],
      highlight_pool_id: "welcome_bonus",
      rule_url: "120_campaign_rule",
      rule_config: {
        action: "scroll",
      },
      trading_url: "https://woofi.com/en/rewards/affiliate",
      trading_config: {
        format: "Invite & Trade",
      },
      user_account_label: "Active traders",
      rule: campaignRuleMap["120"],
    } as CampaignConfig,
    {
      campaign_id: "121",
      referral_codes: ["CHIWEI"],
      title: "Fireant x WOOFi Pro Trading Celebration",
      description: "Exclusively for the Fireant community.",
      prize_pools: [
        {
          pool_id: "trading_volume",
          label: "Trading volume",
          total_prize: 4000,
          currency: "USDC",
          metric: "volume",
          tiers: [],
        },
        {
          pool_id: "raffle",
          label: "Raffle",
          total_prize: 1000,
          currency: "USDC",
          metric: "volume",
          tiers: [],
        },
      ],
      ticket_rules: {
        total_prize: 1000,
        currency: "USDC",
        metric: "volume",
        mode: "linear",
        linear: {
          every: 50000,
          tickets: 1,
        },
      },
      start_time: new Date("2025-08-14T13:00:00Z").toISOString(),
      end_time: new Date("2025-08-30T23:59:59Z").toISOString(),
      rule_url: "121_campaign_rule",
      rule_config: {
        action: "scroll",
      },
      rule: campaignRuleMap["121"],
      trading_url: "https://woofi.com/en/trade/ETH_PERP",
    } as CampaignConfig,
    {
      campaign_id: "127",
      title: "The Haven Trading Competition",
      description: "Exclusively for the Haven users",
      register_time: new Date("2025-09-07T09:00:00Z").toISOString(),
      referral_codes: ["THEHAVEN"],
      image: "",
      start_time: new Date("2025-09-11T09:00:00Z").toISOString(),
      end_time: new Date("2025-10-03T00:00:00Z").toISOString(),
      rule_url: "127_campaign_rule",
      rule_config: {
        action: "scroll",
      },
      rule: campaignRuleMap["121"],
      trading_url: "https://woofi.com/en/trade/ETH_PERP",
      tiered_prize_pools: [
        [
          {
            pool_id: "127_pool_1",
            label: "Trading volume",
            total_prize: 20000,
            currency: "USDC",
            metric: "volume",
            volume_limit: 0,
            tiers: [
              { position: 1, amount: 2000 },
              { position: 2, amount: 1500 },
              { position: 3, amount: 1000 },
              { position_range: [4, 10], amount: 500 },
              { position_range: [11, 20], amount: 200 },
            ],
          },
          {
            pool_id: "127_pool_2",
            label: "Trading pnl",
            total_prize: 10000,
            currency: "USDC",
            metric: "pnl",
            tiers: [
              { position: 1, amount: 2000 },
              { position: 2, amount: 1500 },
              { position: 3, amount: 1000 },
              { position_range: [4, 10], amount: 500 },
              { position_range: [11, 20], amount: 200 },
            ],
          },
        ],
        [
          {
            pool_id: "127_pool_3",
            label: "Trading volume",
            total_prize: 40000,
            currency: "USDC",
            metric: "volume",
            volume_limit: 500000000,
            tiers: [
              { position: 1, amount: 4000 },
              { position: 2, amount: 3000 },
              { position: 3, amount: 2000 },
              { position_range: [4, 10], amount: 1000 },
              { position_range: [11, 20], amount: 400 },
            ],
          },
          {
            pool_id: "127_pool_4",
            label: "Trading pnl",
            total_prize: 20000,
            currency: "USDC",
            metric: "pnl",
            tiers: [
              { position: 1, amount: 4000 },
              { position: 2, amount: 3000 },
              { position: 3, amount: 2000 },
              { position_range: [4, 10], amount: 1000 },
              { position_range: [11, 20], amount: 400 },
            ],
          },
        ],
      ],
    } as CampaignConfig,
  ];
}

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CampaignConfig,
  GeneralRankingWidget,
  CampaignRankingWidget,
  GeneralLeaderboardWidget,
  CampaignLeaderboardWidget,
  LeaderboardPage,
  TradingLeaderboardProvider,
} from "@orderly.network/trading-leaderboard";
import { Box } from "@orderly.network/ui";
import { BaseLayout } from "../../../components/layout";
import { campaignRuleMap } from "./rules/constants";
import { useCustomRanking } from "./useCustomRanking";

export function getCampaigns() {
  // Different campaign configurations
  return [
    {
      campaign_id: "116",
      title: "DAWN OF DOMINANCE",
      description:
        "A new era begins. Outtrade the competition. Climb the ranks. Secure your legacy.",
      image: "/leaderboard/campaign_116.jpg",
      // href: 'https://orderly.network/',
      start_time: new Date("2025-08-18T00:00:00Z").toISOString(),
      end_time: new Date("2025-10-04T23:59:59Z").toISOString(),
      reward_distribution_time: undefined,
      volume_scope: undefined,
      tiered_prize_pools: [
        [
          {
            pool_id: "trading1",
            label: "Trading volume",
            total_prize: 20000,
            currency: "USDC",
            metric: "volume",
            volume_limit: 10000000,
            tiers: [
              { position: 1, amount: 1400 },
              { position: 2, amount: 1200 },
              { position: 3, amount: 1000 },
              { position_range: [4, 5], amount: 750 },
              { position_range: [6, 10], amount: 440 },
              { position_range: [11, 15], amount: 340 },
              { position_range: [16, 25], amount: 275 },
              { position_range: [26, 50], amount: 180 },
              { position_range: [51, 75], amount: 75 },
              { position_range: [76, 100], amount: 50 },
              { position_range: [101, 125], amount: 25 },
            ],
          },
        ],
        [
          {
            pool_id: "trading2",
            label: "Trading volume",
            total_prize: 40000,
            volume_limit: 50000000,
            currency: "USDC",
            metric: "volume",
            tiers: [
              { position: 1, amount: 2800 },
              { position: 2, amount: 2400 },
              { position: 3, amount: 2000 },
              { position_range: [4, 5], amount: 1500 },
              { position_range: [6, 10], amount: 880 },
              { position_range: [11, 15], amount: 680 },
              { position_range: [16, 25], amount: 550 },
              { position_range: [26, 50], amount: 360 },
              { position_range: [51, 75], amount: 150 },
              { position_range: [76, 100], amount: 100 },
              { position_range: [101, 125], amount: 50 },
            ],
          },
        ],
        [
          {
            pool_id: "trading3",
            label: "Trading volume",
            total_prize: 60000,
            volume_limit: 100000000,
            currency: "USDC",
            metric: "volume",
            tiers: [
              { position: 1, amount: 4200 },
              { position: 2, amount: 3600 },
              { position: 3, amount: 3000 },
              { position_range: [4, 5], amount: 2250 },
              { position_range: [6, 10], amount: 1320 },
              { position_range: [11, 15], amount: 1020 },
              { position_range: [16, 25], amount: 825 },
              { position_range: [26, 50], amount: 540 },
              { position_range: [51, 75], amount: 225 },
              { position_range: [76, 100], amount: 150 },
              { position_range: [101, 125], amount: 75 },
            ],
          },
        ],
        [
          {
            pool_id: "trading4",
            label: "Trading volume",
            total_prize: 80000,
            volume_limit: 250000000,
            currency: "USDC",
            metric: "volume",
            tiers: [
              { position: 1, amount: 5600 },
              { position: 2, amount: 4800 },
              { position: 3, amount: 4000 },
              { position_range: [4, 5], amount: 3000 },
              { position_range: [6, 10], amount: 1760 },
              { position_range: [11, 15], amount: 1360 },
              { position_range: [16, 25], amount: 1100 },
              { position_range: [26, 50], amount: 720 },
              { position_range: [51, 75], amount: 300 },
              { position_range: [76, 100], amount: 200 },
              { position_range: [101, 125], amount: 100 },
            ],
          },
        ],
      ],
      prize_pools: [
        {
          pool_id: "trading",
          label: "Trading volume",
          total_prize: 20000,
          currency: "USDC",
          metric: "volume",
          tiers: [
            { position: 1, amount: 1400 },
            { position: 2, amount: 1200 },
            { position: 3, amount: 1000 },
            { position_range: [4, 5], amount: 750 },
            { position_range: [6, 10], amount: 440 },
            { position_range: [11, 15], amount: 340 },
            { position_range: [16, 25], amount: 275 },
            { position_range: [26, 50], amount: 180 },
            { position_range: [51, 75], amount: 75 },
            { position_range: [76, 100], amount: 50 },
            { position_range: [101, 125], amount: 25 },
          ],
        },
        {
          pool_id: "raffle",
          label: "Raffle",
          total_prize: 2500,
          currency: "USDC",
          metric: "volume",
          tiers: [],
        },
        {
          pool_id: "pnl",
          label: "Realized PnL",
          total_prize: 1500,
          currency: "USDC",
          metric: "volume",
          tiers: [],
        },
        {
          pool_id: "social",
          label: "Social ",
          total_prize: 1000,
          currency: "USDC",
          metric: "volume",
          tiers: [],
        },
      ],
      ticket_rules: {
        total_prize: 2500,
        currency: "USDC",
        metric: "volume",
        mode: "tiered",
        tiers: [
          { value: 5000, tickets: 1 },
          { value: 10000, tickets: 5 },
          { value: 50000, tickets: 30 },
          { value: 100000, tickets: 70 },
          { value: 250000, tickets: 200 },
        ],
      },
      rule_url: "www.google.com",
      trading_url: "https://pro.woofi.com/en/trade/ETH_PERP",
    } as CampaignConfig,
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
      hide_estimated_rewards: true,
      rule_url: "121_campaign_rule",
      rule_config: {
        action: "scroll",
      },
      rule: campaignRuleMap["121"],
      leaderboard_config: {
        exclude_leaderboard_columns: ["rewards"],
      },
      trading_url: "https://woofi.com/en/trade/ETH_PERP",
    } as CampaignConfig,
    {
      campaign_id: "128",
      title: "Ascension Campaign",
      description: "Up to 156,000 USDC in rewards!",
      image: "",
      start_time: new Date("2025-09-08T10:00:00Z").toISOString(),
      end_time: new Date("2025-10-20T00:00:00Z").toISOString(),
      hide_rewards: true,
      rule_url: "128_campaign_rule",
      tiered_prize_pools: [
        [
          {
            pool_id: "122_pool_1",
            label: "Trading volume",
            total_prize: 52000,
            currency: "USDC",
            metric: "volume",
            volume_limit: 0,
          },
        ],
        [
          {
            pool_id: "122_pool_2",
            label: "Trading volume",
            total_prize: 104000,
            currency: "USDC",
            metric: "volume",
            volume_limit: 300000000,
          },
        ],
        [
          {
            pool_id: "122_pool_3",
            label: "Trading volume",
            total_prize: 156000,
            currency: "USDC",
            metric: "volume",
            volume_limit: 500000000,
          },
        ],
      ],
      rule_config: {
        action: "scroll",
      },
      rule: campaignRuleMap["121"],
      trading_url: "https://woofi.com/en/trade/ETH_PERP",
      leaderboard_config: {
        use_general_leaderboard: true,
      },
    } as CampaignConfig,
    {
      campaign_id: "127",
      title: "The Haven Trading Competition",
      description: "Exclusively for the Haven users",
      // register_time: new Date("2025-09-08T09:00:00Z").toISOString(),
      referral_codes: ["THEHAVEN"],
      image: "",
      start_time: new Date("2025-09-08T09:00:00Z").toISOString(),
      end_time: new Date("2025-10-03T00:00:00Z").toISOString(),
      hide_rewards: true,
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
          },
        ],
        [
          {
            pool_id: "127_pool_2",
            label: "Trading volume",
            total_prize: 40000,
            currency: "USDC",
            metric: "volume",
            volume_limit: 500000000,
          },
        ],
      ],
      leaderboard_config: {
        use_general_leaderboard: true,
      },
    } as CampaignConfig,
  ];
}

const meta: Meta<typeof LeaderboardPage> = {
  title: "Package/trading-leaderboard",
  component: LeaderboardPage,
  argTypes: {},
  args: {
    campaigns: getCampaigns(),
    href: {
      trading: "https://orderly.network/",
    },
    backgroundSrc: "/leaderboard/background.jpg",
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {
  render: (args) => {
    return <LeaderboardPage {...args} className="oui-py-5" />;
  },
};

export const LayoutPage: Story = {
  render: (args) => {
    const [campaignId, setCampaignId] = useState("120");

    const { dataAdapter } = useCustomRanking();

    return (
      <BaseLayout initialMenu="/leaderboard">
        <LeaderboardPage
          {...args}
          className="oui-py-5"
          campaignId={campaignId}
          onCampaignChange={setCampaignId as any}
          // dataAdapter={dataAdapter}
        />
      </BaseLayout>
    );
  },
};

export const GeneralRanking: Story = {
  render: (args) => {
    return (
      <GeneralRankingWidget fields={["rank", "address", "volume", "pnl"]} />
    );
  },
};

export const CampaignRanking: Story = {
  render: (args) => {
    return (
      <CampaignRankingWidget
        campaignId={14}
        fields={["rank", "address", "volume", "pnl", "rewards"]}
      />
    );
  },
};

export const GeneralLeaderboard: Story = {
  render: (args) => {
    return (
      <Box p={3}>
        <TradingLeaderboardProvider>
          <GeneralLeaderboardWidget />
        </TradingLeaderboardProvider>
      </Box>
    );
  },
};

export const CampaignLeaderboard: Story = {
  render: (args) => {
    return (
      <Box p={3}>
        <TradingLeaderboardProvider>
          <CampaignLeaderboardWidget campaignId={102} />
        </TradingLeaderboardProvider>
      </Box>
    );
  },
};

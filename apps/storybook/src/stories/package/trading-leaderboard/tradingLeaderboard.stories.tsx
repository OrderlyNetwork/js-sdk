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
      start_time: new Date("2025-06-18T00:00:00Z").toISOString(),
      end_time: new Date("2025-07-04T23:59:59Z").toISOString(),
      reward_distribution_time: undefined,
      volume_scope: undefined,
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
      start_time: new Date("2025-08-07 10:00:00 UTC").toISOString(),
      end_time: new Date("2025-08-17 23:59:59 UTC").toISOString(),
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
      end_time: new Date("2025-08-24T23:59:59Z").toISOString(),
      hide_estimated_rewards: true,
      rule_url: "121_campaign_rule",
      rule_config: {
        action: "scroll",
      },
      rule: campaignRuleMap["121"],
      exclude_leaderboard_columns: ["rewards"],
      trading_url: "https://woofi.com/en/trade/ETH_PERP",
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

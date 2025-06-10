import type { Meta, StoryObj } from "@storybook/react";
import { addDays } from "date-fns";
import {
  CampaignConfig,
  GeneralRankingWidget,
  CampaignRankingWidget,
  GeneralLeaderboardWidget,
  CampaignLeaderboardWidget,
  LeaderboardPage,
} from "@orderly.network/trading-leaderboard";
import { Box } from "@orderly.network/ui";
import { BaseLayout } from "../../../components/layout";

function getCampaigns() {
  // Different campaign configurations
  return [
    // Ongoing general campaign with volume-based prizes
    {
      campaign_id: 102,
      title: "RISE ABOVE. OUTTRADE THE REST",
      description:
        "A new era of traders is rising. Are you the one leading the charge? Compete for your share of $15K by climbing the ranks. Only the bold will make it to the top.",
      image: "/leaderboard/woof.png",
      href: "https://orderly.network/",
      start_time: addDays(new Date(), -7).toISOString(),
      end_time: addDays(new Date(), 23).toISOString(),
      reward_distribution_time: addDays(new Date(), 25).toISOString(),
      prize_pools: [
        {
          pool_id: "general_volume",
          label: "Volume Trading Pool",
          total_prize: 10000,
          currency: "USDT",
          metric: "volume" as const,
          tiers: [
            { position: 1, amount: 3000 },
            { position: 2, amount: 2000 },
            { position: 3, amount: 1500 },
            { position_range: [4, 10], amount: 500 },
            { position_range: [11, 50], amount: 100 },
          ],
        },
        {
          pool_id: "pnl_bonus",
          label: "PnL Bonus Pool",
          total_prize: 5000,
          currency: "USDT",
          metric: "pnl" as const,
          tiers: [
            { position: 1, amount: 2000 },
            { position: 2, amount: 1500 },
            { position: 3, amount: 1000 },
            { position_range: [4, 10], amount: 100 },
          ],
        },
      ],
      ticket_rules: {
        total_prize: 1000,
        currency: "WIF",
        metric: "volume" as const,
        mode: "tiered" as const,
        tiers: [
          { value: 50000, tickets: 20 },
          { value: 25000, tickets: 10 },
          { value: 10000, tickets: 5 },
          { value: 5000, tickets: 1 },
        ],
      },
    } as CampaignConfig,

    // Future exclusive campaign for specific referral codes
    {
      campaign_id: 106,
      title: "VIP TRADERS EXCLUSIVE CHAMPIONSHIP",
      description:
        "An exclusive tournament for our VIP community. Massive prizes await the elite traders. Limited to verified VIP members only.",
      image: "/leaderboard/woof.png",
      href: {
        learnMore: "https://orderly.network/vip-campaign",
        trading: "https://orderly.network/trade",
      },
      start_time: addDays(new Date(), 3).toISOString(),
      end_time: addDays(new Date(), 33).toISOString(),
      reward_distribution_time: addDays(new Date(), 35).toISOString(),
      referral_codes: ["VIP2024", "ELITE", "PREMIUM"],
      volume_scope: ["BTC", "ETH", "SOL"],
      prize_pools: [
        {
          pool_id: "vip_exclusive",
          label: "VIP Exclusive Pool",
          total_prize: 50000,
          currency: "USDT",
          metric: "volume" as const,
          tiers: [
            { position: 1, amount: 20000 },
            { position: 2, amount: 15000 },
            { position: 3, amount: 10000 },
            { position_range: [4, 5], amount: 2500 },
          ],
        },
      ],
      ticket_rules: {
        total_prize: 5000,
        currency: "ORD",
        metric: "pnl" as const,
        mode: "linear" as const,
        linear: {
          every: 1000,
          tickets: 1,
        },
      },
    } as CampaignConfig,

    // Past campaign with linear ticket system
    {
      campaign_id: "meme-coins-championship",
      title: "MEME COINS TRADING FRENZY",
      description:
        "The wildest meme coin trading competition has ended! Congratulations to all participants who rode the waves of DOGE, SHIB, and PEPE to victory.",
      image: "/leaderboard/woof.png",
      href: "https://orderly.network/meme-results",
      start_time: addDays(new Date(), -45).toISOString(),
      end_time: addDays(new Date(), -15).toISOString(),
      reward_distribution_time: addDays(new Date(), -10).toISOString(),
      volume_scope: ["DOGE", "SHIB", "PEPE", "BONK", "WIF"],
      prize_pools: [
        {
          pool_id: "meme_volume",
          label: "Meme Volume Champions",
          total_prize: 25000,
          currency: "DOGE",
          metric: "volume" as const,
          tiers: [
            { position: 1, amount: 10000 },
            { position: 2, amount: 7500 },
            { position: 3, amount: 5000 },
            { position_range: [4, 10], amount: 1000 },
            { position_range: [11, 25], amount: 200 },
          ],
        },
      ],
      ticket_rules: {
        total_prize: 10000,
        currency: "SHIB",
        metric: "volume" as const,
        mode: "linear" as const,
        linear: {
          every: 5000,
          tickets: 2,
        },
      },
    } as CampaignConfig,

    // Coming campaign with PnL focus
    {
      campaign_id: "pnl-masters-coming",
      title: "PNL MASTERS TOURNAMENT",
      description:
        "Think you're a trading genius? Prove it in our upcoming PnL-focused competition. Consistent profits beat volume - skill over quantity.",
      image: "/leaderboard/woof.png",
      href: "https://orderly.network/pnl-masters",
      start_time: addDays(new Date(), 14).toISOString(),
      end_time: addDays(new Date(), 44).toISOString(),
      reward_distribution_time: addDays(new Date(), 46).toISOString(),
      prize_pools: [
        {
          pool_id: "pnl_masters",
          label: "PnL Masters Pool",
          total_prize: 20000,
          currency: "USDT",
          metric: "pnl" as const,
          tiers: [
            { position: 1, amount: 8000 },
            { position: 2, amount: 5000 },
            { position: 3, amount: 3000 },
            { position_range: [4, 10], amount: 800 },
            { position_range: [11, 20], amount: 200 },
          ],
        },
      ],
    } as CampaignConfig,

    // Exclusive ongoing campaign for specific brokers
    {
      campaign_id: "broker-exclusive-ongoing",
      title: "BROKER PARTNERSHIP REWARDS",
      description:
        "Exclusive rewards for our partnered broker users. Enhanced prizes and special recognition for our valued community members.",
      image: "/leaderboard/woof.png",
      href: "https://orderly.network/broker-partnership",
      start_time: addDays(new Date(), -10).toISOString(),
      end_time: addDays(new Date(), 20).toISOString(),
      reward_distribution_time: addDays(new Date(), 22).toISOString(),
      referral_codes: ["PARTNER1", "BROKER2024", "ALLIANCE"],
      prize_pools: [
        {
          pool_id: "broker_volume",
          label: "Broker Volume Pool",
          total_prize: 15000,
          currency: "USDT",
          metric: "volume" as const,
          tiers: [
            { position: 1, amount: 5000 },
            { position: 2, amount: 3000 },
            { position: 3, amount: 2000 },
            { position_range: [4, 15], amount: 500 },
            { position_range: [16, 30], amount: 100 },
          ],
        },
        {
          pool_id: "broker_pnl",
          label: "Broker PnL Pool",
          total_prize: 8000,
          currency: "USDT",
          metric: "pnl" as const,
          tiers: [
            { position: 1, amount: 3000 },
            { position: 2, amount: 2500 },
            { position: 3, amount: 1500 },
            { position_range: [4, 10], amount: 200 },
          ],
        },
      ],
      ticket_rules: {
        total_prize: 2000,
        currency: "BTC",
        metric: "volume" as const,
        mode: "tiered" as const,
        tiers: [
          { value: 100000, tickets: 50 },
          { value: 50000, tickets: 25 },
          { value: 20000, tickets: 10 },
          { value: 10000, tickets: 5 },
        ],
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
    return (
      <BaseLayout initialMenu="/leaderboard">
        <LeaderboardPage {...args} className="oui-py-5" />
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
        <GeneralLeaderboardWidget />
      </Box>
    );
  },
};

export const CampaignLeaderboard: Story = {
  render: (args) => {
    return (
      <Box p={3}>
        <CampaignLeaderboardWidget campaignId={102} />
      </Box>
    );
  },
};

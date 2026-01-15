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
import { Box, Button, cn, Flex, Text } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { BaseLayout } from "../../../components/layout";
import { getCampaigns } from "./config";
import { campaignRuleMap } from "./rules/constants";
import { useCustomRanking } from "./useCustomRanking";

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

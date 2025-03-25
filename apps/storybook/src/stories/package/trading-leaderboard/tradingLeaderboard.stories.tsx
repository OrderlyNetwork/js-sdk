import type { Meta, StoryObj } from "@storybook/react";
import {
  LeaderboardWidget,
  TradingListWidget,
  CampaignsWidget,
  TradingLeaderboardProvider,
} from "@orderly.network/trading-leaderboard";
import { OrderlyLayout } from "../../../components/layout";
import { Box } from "@orderly.network/ui";
import { subDays, addDays } from "date-fns";

const meta: Meta<typeof LeaderboardWidget> = {
  title: "Package/trading-leaderboard",
  component: LeaderboardWidget,
  argTypes: {},
  args: {
    campaigns: [
      {
        title: "Campaign title",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        image: "/pnl/poster_bg_1.png",
        startTime: subDays(new Date(), 1),
        endTime: addDays(new Date(), 1),
        href: "https://orderly.network/",
      },
      {
        title: "Campaign title11",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        image: "/pnl/poster_bg_1.png",
        startTime: subDays(new Date(), 2),
        endTime: addDays(new Date(), 1),
        href: "https://orderly.network/",
      },
      {
        title: "Campaign title1",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        image: "/pnl/poster_bg_2.png",
        startTime: subDays(new Date(), 7),
        endTime: subDays(new Date(), 1),
        href: "https://orderly.network/",
      },
      {
        title: "Campaign title2",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
        image: "/pnl/poster_bg_3.png",
        startTime: addDays(new Date(), 1),
        endTime: addDays(new Date(), 7),
        href: "https://orderly.network/",
      },
    ],
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const Container = (props: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  return (
    <Box
      width="100%"
      my={5}
      style={{
        minHeight: 379,
        maxHeight: 2560,
        overflow: "hidden",
        // Make the table scroll instead of the page scroll
        height: "calc(100vh - 48px - 29px - 40px)",
        ...props.style,
      }}
    >
      {props.children}
    </Box>
  );
};

export const Page: Story = {
  render: (args) => {
    return (
      <Container style={{ height: "calc(100vh - 40px)" }}>
        <LeaderboardWidget {...args} />
      </Container>
    );
  },
};

export const LayoutPage: Story = {
  render: (args) => {
    return (
      <OrderlyLayout initialMenu="/leaderboard">
        <Container>
          <LeaderboardWidget {...args} />
        </Container>
      </OrderlyLayout>
    );
  },
};

export const Campaigns: Story = {
  render: (args) => {
    return (
      <TradingLeaderboardProvider campaigns={args.campaigns}>
        <CampaignsWidget />
      </TradingLeaderboardProvider>
    );
  },
};

export const TradingList: Story = {
  render: (args) => {
    return <TradingListWidget style={{ height: "calc(100vh - 0px)" }} />;
  },
};

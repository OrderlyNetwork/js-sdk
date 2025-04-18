import type { Meta, StoryObj } from "@storybook/react";
import {
  LeaderboardWidget,
  TradingListWidget,
  CampaignsWidget,
  TradingLeaderboardProvider,
} from "@orderly.network/trading-leaderboard";
import { BaseLayout } from "../../../components/layout";
import { Box, useScreen } from "@orderly.network/ui";
import { subDays, addDays } from "date-fns";
import { useScaffoldContext } from "@orderly.network/ui-scaffold";

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
        startTime: new Date("2025-03-26T14:30:00Z"),
        endTime: new Date("2025-04-02T23:59:00Z"),
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
    href: {
      trading: "https://app.orderly.network/",
    },
    backgroundSrc: "/leaderboard/background.jpg",
    // backgroundSrc: "/leaderboard/background.webm",
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
  const { topNavbarHeight, footerHeight, announcementHeight } =
    useScaffoldContext();
  const { isMobile } = useScreen();
  return (
    <Box
      width="100%"
      // my={5}
      style={{
        minHeight: 379,
        maxHeight: 2560,
        overflow: "hidden",
        // Make the table scroll instead of the page scroll
        height: isMobile
          ? "100%"
          : `calc(100vh - ${topNavbarHeight}px - ${footerHeight}px - ${
              announcementHeight ? announcementHeight + 12 : 0
            }px)`,
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
      <Container style={{ height: "calc(100vh)" }}>
        <LeaderboardWidget {...args} className="oui-py-5" />
      </Container>
    );
  },
};

export const LayoutPage: Story = {
  render: (args) => {
    const { isDesktop } = useScreen();
    return (
      <BaseLayout
        initialMenu="/leaderboard"
        classNames={{
          root: isDesktop ? "oui-overflow-hidden" : undefined,
        }}
      >
        <Container>
          <LeaderboardWidget {...args} className="oui-py-5" />
        </Container>
      </BaseLayout>
    );
  },
};

export const Campaigns: Story = {
  render: (args) => {
    return (
      <TradingLeaderboardProvider {...args}>
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

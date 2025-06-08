import type { Meta, StoryObj } from "@storybook/react";
import {
  Campaign,
  TradingListWidget,
  LeaderboardWidget,
  LeaderboardPage,
  TradingLeaderboardProvider,
} from "@orderly.network/trading-leaderboard";
import { Box, useScreen } from "@orderly.network/ui";
import { useScaffoldContext } from "@orderly.network/ui-scaffold";
import { BaseLayout } from "../../../components/layout";

function getCampaigns() {
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const dateRange = [
    // ongoing
    { startTime: addDays(new Date(), -1), endTime: addDays(new Date(), 30) },
    // future
    { startTime: addDays(new Date(), 1), endTime: addDays(new Date(), 30) },
    // past
    { startTime: addDays(new Date(), -30), endTime: addDays(new Date(), -1) },
  ];

  return dateRange.map(
    (date) =>
      ({
        title: "RISE ABOVE. OUTTRADE THE REST",
        description:
          "A new era of traders is rising. Are you the one leading the charge? Compete for your share of $10K by climbing the ranks. Only the bold will make it to the top.",
        image: "/leaderboard/campaign.jpg",
        href: "https://orderly.network/",
        ...date,
      }) as Campaign,
  );
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
      px={3}
      style={{
        minHeight: 379,
        maxHeight: 2560,
        overflow: "hidden",
        // Make the table scroll instead of the page scroll
        height: isMobile ? "100%" : "100%",
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
        <LeaderboardPage {...args} className="oui-py-5" />
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
        // classNames={{
        //   root: isDesktop ? "oui-overflow-hidden" : undefined,
        // }}
      >
        <Container>
          <LeaderboardPage {...args} className="oui-py-5" />
        </Container>
      </BaseLayout>
    );
  },
};

export const TradingList: Story = {
  render: (args) => {
    return <TradingListWidget style={{ height: "calc(100vh - 0px)" }} />;
  },
};

export const Leaderboard: Story = {
  render: (args) => {
    return (
      <Box p={3}>
        <LeaderboardWidget />
      </Box>
    );
  },
};

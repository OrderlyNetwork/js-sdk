import { FC } from "react";
import { Flex, TabPanel, Tabs, Text } from "@orderly.network/ui";

export enum TradingTab {
  Volume = "volume",
  Pnl = "pnl",
}

type LeaderboardTabsProps = {
  activeTab: string;
  onTabChange: (tab: TradingTab) => void;
  isMobile?: boolean;
};

export const LeaderboardTabs: FC<LeaderboardTabsProps> = (props) => {
  return (
    <Flex
      width="100%"
      pb={3}
      justify="between"
      className="oui-border-b oui-border-line"
    >
      <Tabs
        value={props.activeTab}
        onValueChange={props.onTabChange as (tab: string) => void}
        variant="contained"
        size="lg"
      >
        <TabPanel title="Trading volume" value="deposit"></TabPanel>
        <TabPanel title="Realized PnL" value="withdraw"></TabPanel>
      </Tabs>
      <Text size="sm" intensity={36}>
        {props.isMobile
          ? "Updated hourly."
          : "Last update: 2023-12-13 12:00 UTC"}
      </Text>
    </Flex>
  );
};

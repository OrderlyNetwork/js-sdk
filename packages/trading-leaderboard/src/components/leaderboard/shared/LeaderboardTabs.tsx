import { FC, useMemo } from "react";
import { cn, Flex, TabPanel, Tabs, Text } from "@orderly.network/ui";
import { formatUpdateDate } from "../../../utils";
import { useTradingLeaderboardContext } from "../../provider";

export enum TradingTab {
  Volume = "volume",
  Pnl = "pnl",
}

type LeaderboardTabsProps = {
  activeTab: string;
  onTabChange: (tab: TradingTab) => void;
  isMobile?: boolean;
  className?: string;
};

export const LeaderboardTabs: FC<LeaderboardTabsProps> = (props) => {
  const { updatedTime } = useTradingLeaderboardContext();

  const updateTime = useMemo(() => {
    if (props.isMobile) {
      return "Updated hourly.";
    }
    if (updatedTime) {
      return `Last update: ${formatUpdateDate(updatedTime)}`;
    }
    return "";
  }, [props.isMobile, updatedTime]);

  return (
    <Flex
      width="100%"
      py={3}
      justify="between"
      className={cn("oui-border-b oui-border-line", props.className)}
    >
      <Tabs
        value={props.activeTab}
        onValueChange={props.onTabChange as (tab: string) => void}
        variant="contained"
        size="lg"
      >
        <TabPanel title="Trading volume" value={TradingTab.Volume}></TabPanel>
        <TabPanel title="Realized PnL" value={TradingTab.Pnl}></TabPanel>
      </Tabs>
      <Text size="sm" intensity={36}>
        {updateTime}
      </Text>
    </Flex>
  );
};

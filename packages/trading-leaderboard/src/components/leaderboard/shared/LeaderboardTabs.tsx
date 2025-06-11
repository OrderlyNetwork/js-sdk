import { FC, useMemo } from "react";
import { cn, Flex, TabPanel, Tabs } from "@orderly.network/ui";
import { LeaderboardTab } from "../../../type";
import { formatUpdateDate } from "../../../utils";
import { useTradingLeaderboardContext } from "../../provider";

type LeaderboardTabsProps = {
  isMobile?: boolean;
  className?: string;
  activeTab: LeaderboardTab;
  onTabChange: (tab: LeaderboardTab) => void;
};

export const LeaderboardTabs: FC<LeaderboardTabsProps> = (props) => {
  const { updatedTime } = useTradingLeaderboardContext();

  const updateTime = useMemo(() => {
    if (updatedTime) {
      return formatUpdateDate(updatedTime);
    }
    return "";
  }, [props.isMobile, updatedTime]);

  return (
    <Flex
      width="100%"
      py={3}
      justify="between"
      className={cn(
        "oui-trading-leaderboard-ranking-tabs",
        "oui-border-b oui-border-line",
        props.className,
      )}
    >
      <Tabs
        value={props.activeTab}
        onValueChange={props.onTabChange as (tab: string) => void}
        variant="contained"
        size="lg"
      >
        <TabPanel
          title="Trading volume"
          value={LeaderboardTab.Volume}
        ></TabPanel>
        <TabPanel title="Realized PnL" value={LeaderboardTab.Pnl}></TabPanel>
      </Tabs>
      {updateTime && (
        <Flex
          itemAlign="start"
          direction={props.isMobile ? "column" : "row"}
          gap={1}
          className={cn(
            props.isMobile ? "oui-text-3xs" : "oui-text-sm",
            "oui-text-base-contrast-36",
          )}
        >
          <span>Last update:</span>
          <span>{updateTime}</span>
        </Flex>
      )}
    </Flex>
  );
};

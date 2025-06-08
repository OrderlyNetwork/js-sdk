import { FC } from "react";
import { cn, Box, useScreen } from "@orderly.network/ui";
import { GeneralRankingWidget } from "../ranking/generalRanking";
import { LeaderboardFilter } from "./components/LeaderboardFilter";
import { LeaderboardTabs } from "./components/LeaderboardTabs";
import { LeaderboardScriptReturn } from "./leaderboard.script";

export type LeaderboardProps = {
  style?: React.CSSProperties;
  className?: string;
} & LeaderboardScriptReturn;

export const Leaderboard: FC<LeaderboardProps> = (props) => {
  const { isMobile } = useScreen();

  if (isMobile) {
    return (
      <Box
        pt={2}
        px={3}
        r="2xl"
        intensity={900}
        width="100%"
        className={cn("oui-trading-leaderboard oui-relative")}
      >
        <LeaderboardFilter {...props} />
        <LeaderboardTabs
          activeTab={props.activeTab}
          onTabChange={props.onTabChange}
          isMobile={isMobile}
        />

        <GeneralRankingWidget
          dateRange={props.dateRange}
          address={props.searchValue}
        />
      </Box>
    );
  }

  return (
    <Box
      pt={2}
      px={6}
      r="2xl"
      intensity={900}
      className={cn(
        "oui-trading-leaderboard oui-relative",
        "oui-mx-auto oui-max-w-[1040px] ",
      )}
    >
      <LeaderboardFilter {...props} />
      <LeaderboardTabs
        activeTab={props.activeTab}
        onTabChange={props.onTabChange}
        isMobile={isMobile}
      />

      <GeneralRankingWidget
        dateRange={props.dateRange}
        address={props.searchValue}
      />
    </Box>
  );
};

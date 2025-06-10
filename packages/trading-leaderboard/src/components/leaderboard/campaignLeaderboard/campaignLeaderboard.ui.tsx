import { FC, useMemo } from "react";
import { cn, Box, useScreen } from "@orderly.network/ui";
import { CampaignRankingWidget } from "../../ranking/campaignRanking";
import { RankingColumnFields } from "../../ranking/shared/column";
import { LeaderboardTabs, TradingTab } from "../shared/LeaderboardTabs";
import { CampaignLeaderboardScriptReturn } from "./campaignLeaderboard.script";

export type CampaignLeaderboardProps = {
  style?: React.CSSProperties;
  className?: string;
  campaignId: number | string;
} & CampaignLeaderboardScriptReturn;

export const CampaignLeaderboard: FC<CampaignLeaderboardProps> = (props) => {
  const { isMobile } = useScreen();

  const fields = useMemo<RankingColumnFields[]>(() => {
    return [
      "rank",
      "address",
      props.activeTab === TradingTab.Volume ? "volume" : "pnl",
      "rewards",
    ];
  }, [isMobile, props.activeTab]);

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
        <LeaderboardTabs
          activeTab={props.activeTab}
          onTabChange={props.onTabChange}
          isMobile={isMobile}
        />

        <CampaignRankingWidget campaignId={props.campaignId} fields={fields} />
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
        "oui-mx-auto oui-max-w-[992px]",
      )}
    >
      <LeaderboardTabs
        activeTab={props.activeTab}
        onTabChange={props.onTabChange}
        isMobile={isMobile}
      />
      <CampaignRankingWidget campaignId={props.campaignId} fields={fields} />
    </Box>
  );
};

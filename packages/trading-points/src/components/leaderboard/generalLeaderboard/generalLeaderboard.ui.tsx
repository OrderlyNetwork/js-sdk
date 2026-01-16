import { FC } from "react";
import { cn, Box, useScreen } from "@orderly.network/ui";
import { GeneralRankingWidget } from "../../ranking/generalRanking";
import { RankingColumnFields } from "../../ranking/shared/column";
import { GeneralLeaderboardScriptReturn } from "./generalLeaderboard.script";

export type GeneralLeaderboardProps = {
  style?: React.CSSProperties;
  className?: string;
  campaignDateRange?: {
    start_time: Date | string;
    end_time: Date | string;
  };
} & GeneralLeaderboardScriptReturn;

export const GeneralLeaderboard: FC<GeneralLeaderboardProps> = (props) => {
  const { isMobile } = useScreen();

  const fields = ["rank", "address", "points"] as RankingColumnFields[];

  if (isMobile) {
    return (
      <Box
        pt={2}
        px={3}
        r="2xl"
        intensity={900}
        width="100%"
        className={cn(
          "oui-trading-leaderboard-general-leaderboard oui-relative",
          props.className,
        )}
        style={props.style}
      >
        <GeneralRankingWidget address={props.searchValue} fields={fields} />
      </Box>
    );
  }

  return (
    <Box
      pt={2}
      px={6}
      r="2xl"
      className={cn(
        "oui-trading-leaderboard-general-leaderboard oui-relative",
        "oui-mx-auto oui-max-w-[992px]",
        props.className,
      )}
      style={props.style}
    >
      <GeneralRankingWidget address={props.searchValue} fields={fields} />
    </Box>
  );
};

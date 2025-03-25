import { FC } from "react";
import { useLeaderboardScript } from "./leaderboard.script";
import { Leaderboard } from "./leaderboard.ui";
import {
  TradingLeaderboardProvider,
  TradingLeaderboardProviderProps,
} from "../../components/provider";

export type LeaderboardWidgetProps = TradingLeaderboardProviderProps & {
  className?: string;
};

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = (props) => {
  const state = useLeaderboardScript(props.backgroundSrc);
  return (
    <TradingLeaderboardProvider campaigns={props.campaigns} href={props.href}>
      <Leaderboard {...state} className={props.className} />
    </TradingLeaderboardProvider>
  );
};

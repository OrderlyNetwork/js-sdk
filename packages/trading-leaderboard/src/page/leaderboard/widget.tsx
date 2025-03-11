import { FC } from "react";
import { useLeaderboardScript } from "./leaderboard.script";
import { Leaderboard } from "./leaderboard.ui";
import {
  TradingLeaderboardProvider,
  TradingLeaderboardProviderProps,
} from "../../components/provider";

export type LeaderboardWidgetProps = TradingLeaderboardProviderProps;

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = (props) => {
  const state = useLeaderboardScript();
  return (
    <TradingLeaderboardProvider campaigns={props.campaigns}>
      <Leaderboard {...state} />
    </TradingLeaderboardProvider>
  );
};

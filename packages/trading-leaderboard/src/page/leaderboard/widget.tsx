import { FC } from "react";
import { useLeaderboardScript } from "./leaderboard.script";
import { Leaderboard, LeaderboardProps } from "./leaderboard.ui";
import {
  TradingLeaderboardProvider,
  TradingLeaderboardProviderProps,
} from "../../components/provider";

export type LeaderboardWidgetProps = TradingLeaderboardProviderProps &
  Pick<LeaderboardProps, "style" | "className">;

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = (props) => {
  const state = useLeaderboardScript(props.backgroundSrc);
  return (
    <TradingLeaderboardProvider campaigns={props.campaigns} href={props.href}>
      <Leaderboard {...state} className={props.className} style={props.style} />
    </TradingLeaderboardProvider>
  );
};

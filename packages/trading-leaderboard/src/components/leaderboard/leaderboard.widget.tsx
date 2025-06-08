import { FC } from "react";
import { useLeaderboardScript } from "./leaderboard.script";
import { Leaderboard, LeaderboardProps } from "./leaderboard.ui";

export type LeaderboardWidgetProps = Pick<
  LeaderboardProps,
  "style" | "className"
>;

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = (props) => {
  const state = useLeaderboardScript();

  return (
    <Leaderboard {...state} className={props.className} style={props.style} />
  );
};

import { FC } from "react";
import { useScreen } from "@orderly.network/ui";
import { MobileLeaderboardWidget } from "./leaderboard.mobile.ui";
import { useLeaderboardScript } from "./leaderboard.script";
import { Leaderboard, LeaderboardProps } from "./leaderboard.ui";

export type LeaderboardWidgetProps = Pick<
  LeaderboardProps,
  "style" | "className"
>;

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = (props) => {
  const { isMobile } = useScreen();
  const state = useLeaderboardScript();

  if (isMobile) {
    return <MobileLeaderboardWidget {...state} />;
  }

  return (
    <Leaderboard {...state} className={props.className} style={props.style} />
  );
};

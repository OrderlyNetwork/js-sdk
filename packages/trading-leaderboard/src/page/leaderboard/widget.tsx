import { FC } from "react";
import { useLeaderboardScript } from "./leaderboard.script";
import { Leaderboard, LeaderboardProps } from "./leaderboard.ui";
import {
  TradingLeaderboardProvider,
  TradingLeaderboardProviderProps,
} from "../../components/provider";
import { MobileLeaderboardWidget } from "./leaderboard.mobile.ui";

export type LeaderboardWidgetProps = TradingLeaderboardProviderProps &
  Pick<LeaderboardProps, "style" | "className">;

export const LeaderboardWidget: FC<LeaderboardWidgetProps> = (props) => {
  const state = useLeaderboardScript({
    backgroundSrc: props.backgroundSrc,
    campaigns: props.campaigns,
  });

  return (
    <TradingLeaderboardProvider campaigns={props.campaigns} href={props.href}>
      {state.isMobile ? (
        <MobileLeaderboardWidget {...state} />
      ) : (
        <Leaderboard
          {...state}
          className={props.className}
          style={props.style}
        />
      )}
    </TradingLeaderboardProvider>
  );
};

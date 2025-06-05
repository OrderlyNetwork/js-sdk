import { FC } from "react";
import { cn, useScreen } from "@orderly.network/ui";
import { Background } from "../../components/background";
import {
  LeaderboardWidget,
  LeaderboardWidgetProps,
} from "../../components/leaderboard";
import { TradingLeaderboardProvider } from "../../components/provider";

export type LeaderboardPageProps = LeaderboardWidgetProps & {
  style?: React.CSSProperties;
  className?: string;
};

export const LeaderboardPage: FC<LeaderboardPageProps> = (props) => {
  const { isMobile } = useScreen();
  return (
    <TradingLeaderboardProvider>
      <div
        style={{
          paddingBottom: "calc(64px + env(safe-area-inset-bottom))",
        }}
        className={cn(
          "oui-relative oui-grid oui-h-[calc(100vh-44px)] oui-gap-1 oui-bg-base-10",
          "oui-mix-blend-screen",
          props.className,
        )}
      >
        {/* <Background backgroundSrc={props.backgroundSrc} /> */}
        <LeaderboardWidget {...props} />
      </div>
    </TradingLeaderboardProvider>
  );
};

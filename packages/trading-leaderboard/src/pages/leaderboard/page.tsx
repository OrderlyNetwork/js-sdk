import { FC, ReactNode } from "react";
import { cn, Flex, Text } from "@orderly.network/ui";
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
  return (
    <TradingLeaderboardProvider>
      <div
        style={{
          paddingBottom: "calc(64px + env(safe-area-inset-bottom))",
        }}
        className={cn(
          "oui-relative oui-bg-base-10",
          "oui-font-semibold",
          props.className,
        )}
      >
        {/* <Background backgroundSrc={props.backgroundSrc} /> */}
        <Title title="Leaderboard" />
        <LeaderboardWidget {...props} />
      </div>
    </TradingLeaderboardProvider>
  );
};

const Title = (props: { title: ReactNode }) => {
  return (
    <Flex mb={6} justify="center">
      <Text className="oui-text-[32px] oui-font-bold">{props.title}</Text>
    </Flex>
  );
};

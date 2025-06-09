import { FC, ReactNode } from "react";
import { Box, cn, Flex, Text } from "@orderly.network/ui";
import { Background } from "../../components/background";
import { CampaignsWidget } from "../../components/campaigns/campaigns.widget";
import {
  GeneralLeaderboardWidget,
  GeneralLeaderboardWidgetProps,
} from "../../components/leaderboard/generalLeaderboard";
import {
  TradingLeaderboardProvider,
  TradingLeaderboardProviderProps,
} from "../../components/provider";
import { RewardsWidget } from "../../components/rewards/rewards.widget";

export type LeaderboardPageProps = GeneralLeaderboardWidgetProps &
  TradingLeaderboardProviderProps & {
    style?: React.CSSProperties;
    className?: string;
  };

export const LeaderboardPage: FC<LeaderboardPageProps> = (props) => {
  return (
    <TradingLeaderboardProvider {...props}>
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
        <CampaignsWidget />
        <RewardsWidget />
        {/* <Background backgroundSrc={props.backgroundSrc} /> */}
        <LeaderboardTitle title="Leaderboard" />
        <GeneralLeaderboardWidget {...props} />
      </div>
    </TradingLeaderboardProvider>
  );
};

export const LeaderboardTitle = (props: { title: ReactNode }) => {
  return (
    <Flex mb={6} gapY={1} justify="center" direction="column">
      <Text className="oui-text-[32px] oui-font-bold">{props.title}</Text>
      <Box
        width={24}
        height={6}
        r="base"
        className="oui-bg-[linear-gradient(270deg,rgb(var(--oui-gradient-brand-start))_0%,rgb(var(--oui-gradient-brand-end))_100%)]"
      />
    </Flex>
  );
};

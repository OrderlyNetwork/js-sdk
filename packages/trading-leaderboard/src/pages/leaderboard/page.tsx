import { FC, ReactNode } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, Flex, Text } from "@orderly.network/ui";
import { Background } from "../../components/background";
import { CampaignsWidget } from "../../components/campaigns/campaigns.widget";
import { CampaignLeaderboardWidget } from "../../components/leaderboard/campaignLeaderboard";
import {
  GeneralLeaderboardWidget,
  GeneralLeaderboardWidgetProps,
} from "../../components/leaderboard/generalLeaderboard";
import {
  TradingLeaderboardProvider,
  TradingLeaderboardProviderProps,
  useTradingLeaderboardContext,
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
          "oui-trading-leaderboard-page",
          "oui-relative oui-bg-base-10",
          "oui-font-semibold",
          props.className,
        )}
      >
        <CampaignsWidget className="oui-relative oui-z-[1] oui-mx-6" />
        <RewardsWidget />
        <LeaderboardSection {...props} />
      </div>
    </TradingLeaderboardProvider>
  );
};

type LeaderboardSectionProps = {
  style?: React.CSSProperties;
  className?: string;
};

export const LeaderboardSection: FC<LeaderboardSectionProps> = (props) => {
  const { t } = useTranslation();
  const { currentCampaignId, currentCampaign, backgroundSrc } =
    useTradingLeaderboardContext();

  if (currentCampaignId === "general") {
    return (
      <div className={cn("oui-mix-blend-screen")}>
        <Background backgroundSrc={backgroundSrc} />
        <GeneralLeaderboardWidget {...props} className="oui-mt-10" />
      </div>
    );
  }

  if (currentCampaign && currentCampaignId != "general") {
    return (
      <>
        <LeaderboardTitle title={t("tradingLeaderboard.leaderboard")} />
        <CampaignLeaderboardWidget {...props} campaignId={currentCampaignId} />
      </>
    );
  }

  return null;
};

export const LeaderboardTitle = (props: { title: ReactNode }) => {
  return (
    <Flex mb={6} gapY={1} justify="center" direction="column">
      <Text
        className={cn(
          "oui-trading-leaderboard-title",
          "oui-text-[32px] oui-font-bold oui-leading-[44px]",
        )}
      >
        {props.title}
      </Text>
      <Box
        width={24}
        height={6}
        r="base"
        className="oui-bg-[linear-gradient(270deg,rgb(var(--oui-gradient-brand-start))_0%,rgb(var(--oui-gradient-brand-end))_100%)]"
      />
    </Flex>
  );
};

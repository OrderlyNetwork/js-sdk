import { FC, useMemo } from "react";
import { useTradingRewardsStatus, EpochStatus } from "@orderly.network/hooks";
import { Flex, Box, cn } from "@orderly.network/ui";
import { AvailableToClaimWidget } from "./availableToClaim";
import { CurEpochWidget } from "./curEpoch";
import { TradingRewardsProvider } from "./provider";
import { RewardsHistoryWidget } from "./rewardHistory";
import { StakeBoosterWidget } from "./stakeBooster";
import { TitleConfig } from "./title/title.script";
import { TitleWidget } from "./title/title.widget";

export const HomePage: FC<{
  titleConfig?: TitleConfig;
  className?: string;
  showEpochPauseCountdown?: boolean;
}> = (props) => {
  return (
    <TradingRewardsProvider
      titleConfig={props.titleConfig}
      showEpochPauseCountdown={props.showEpochPauseCountdown}
    >
      <Flex
        id="oui-tradingRewards-home-page"
        className={cn("oui-h-lvw oui-w-full", props.className)}
        direction={"column"}
        gap={4}
      >
        <TitleWidget />
        <Flex className="oui-flex oui-size-full oui-flex-col oui-gap-4 2xl:oui-flex-row 2xl:oui-items-stretch">
          <Box className="oui-w-full 2xl:oui-size-auto 2xl:oui-flex-1">
            <CurEpochWidget />
          </Box>
          <Flex className="oui-flex oui-w-full oui-flex-col oui-gap-4 lg:oui-flex-row 2xl:oui-flex-1 2xl:oui-flex-col">
            <AvailableToClaimWidget />
            <StakeBooster />
          </Flex>
        </Flex>
        <RewardsHistoryWidget />
      </Flex>
    </TradingRewardsProvider>
  );
};

const StakeBooster = () => {
  const { statusInfo } = useTradingRewardsStatus(false);
  const isStakeBoosterVisible = useMemo(() => {
    return statusInfo?.epochStatus === EpochStatus.active;
  }, [statusInfo]);
  return isStakeBoosterVisible ? <StakeBoosterWidget /> : null;
};

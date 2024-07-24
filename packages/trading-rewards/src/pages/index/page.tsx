import { Flex, Box, cn } from "@orderly.network/ui";
import { TitleWidget } from "./title/title.widget";
import { CurEpochWidget } from "./curEpoch";
import { AvailableToClaimWidget } from "./availableToClaim";
import { StakeBoosterWidget } from "./stakeBooster";
import { RewardsHistoryWidget } from "./rewardHistory";
import { TradingRewardsProvider } from "./provider";
import { FC } from "react";
import { TitleConfig } from "./title/title.script";

export const HomePage: FC<{
  titleConfig?: TitleConfig;
}> = (props) => {
  return (
    <TradingRewardsProvider titleConfig={props.titleConfig}>
      <Flex
        id="oui-tradingRewards-home-page"
        className={cn(
          "oui-h-lvw oui-w-full",
          // padding
          // "oui-p-4 lg:oui-p-6 xl:oui-p-3 oui-my-4"
        )}
        direction={"column"}
        gap={4}
      >
        <TitleWidget />
        <Flex className="oui-flex oui-flex-col 2xl:oui-flex-row 2xl:oui-items-stretch oui-gap-4 oui-w-full oui-h-full">
          <Box className="2xl:oui-flex-1 2xl:oui-h-auto oui-w-full 2xl:oui-w-auto">
            <CurEpochWidget />
          </Box>
          <Flex className="2xl:oui-flex-1 oui-flex oui-flex-col lg:oui-flex-row oui-gap-4 2xl:oui-flex-col oui-w-full">
            <AvailableToClaimWidget />
            <StakeBoosterWidget />
          </Flex>
        </Flex>
        <RewardsHistoryWidget />
      </Flex>
    </TradingRewardsProvider>
  );
};

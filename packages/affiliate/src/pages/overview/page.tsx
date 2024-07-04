import { Flex, Box, cn } from "@orderly.network/ui";
import { TradingRewardsProvider } from "./provider";
import { TitleWidget } from "./title";
import { SubtitleWidget } from "./subtitle";

export const OverviewPage = () => {
  return (
    <TradingRewardsProvider>
      <Flex
        className={cn(
          "oui-h-lvw oui-w-lvw",
          // padding
          "oui-p-4 lg:oui-p-6 xl:oui-p-3"
        )}
        direction={"column"}
        gap={4}
      >
       <TitleWidget />
       <SubtitleWidget />
      </Flex>
    </TradingRewardsProvider>
  );
};

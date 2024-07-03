import { Flex, Box, cn } from "@orderly.network/ui";
import { TradingRewardsProvider } from "./provider";

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
       
      </Flex>
    </TradingRewardsProvider>
  );
};

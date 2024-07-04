import { Flex, Box, cn } from "@orderly.network/ui";
import { TradingRewardsProvider } from "./provider";
import { TitleWidget } from "./title";
import { SubtitleWidget } from "./subtitle";
import { AsAnAffiliateWidget } from "./asAnAffilate";
import { AsATraderWidget } from "./asATrader";
import { BecomeAffiliateWidget } from "./becomeAffiliate";

export const OverviewPage = () => {
  return (
    <TradingRewardsProvider>
      <Flex
        className={cn(
          "oui-h-lvw oui-w-lvw",
          // padding
          "oui-p-4 lg:oui-p-6 xl:oui-p-3",
          "oui-font-semibold"
        )}
        direction={"column"}
        gap={4}
      >
        <TitleWidget />
        <SubtitleWidget />
        <Flex className="oui-flex oui-flex-col xl:oui-flex-row oui-gap-6 xl:oui-gap-[36px] oui-w-full">
          <AsAnAffiliateWidget />
          <AsATraderWidget />
        </Flex>
        <BecomeAffiliateWidget />
      </Flex>
    </TradingRewardsProvider>
  );
};

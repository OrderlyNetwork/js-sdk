import { Flex, Box, cn } from "@orderly.network/ui";
import { AffiliateProvider } from "./provider";
import { AsAnAffiliateWidget } from "./asAnAffilate";
import { AsATraderWidget } from "./asATrader";
import { BecomeAffiliateWidget } from "./becomeAffiliate";
import { TopWidget } from "./top";

export const IndexPage = () => {
  return (
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
      <TopWidget />
      <Flex className="oui-flex oui-flex-col xl:oui-flex-row oui-gap-6 xl:oui-gap-[36px] oui-w-full oui-items-stretch">
        <AsAnAffiliateWidget />
        <AsATraderWidget />
      </Flex>
      <BecomeAffiliateWidget />
    </Flex>
  );
};

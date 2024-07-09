import { Flex, Box, cn } from "@orderly.network/ui";
import { BecomeAffiliateWidget } from "./becomeAffiliate";
import { TopWidget } from "./top";
import { CardWidget } from "./card";

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
      <CardWidget />
      <BecomeAffiliateWidget />
    </Flex>
  );
};

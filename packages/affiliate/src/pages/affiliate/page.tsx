import { Flex, Box, cn } from "@orderly.network/ui";
import { AffiliateProvider } from "../overview/provider";
export const AffiliatePage = () => {
  return (
    <AffiliateProvider>
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
       
      </Flex>
    </AffiliateProvider>
  );
};

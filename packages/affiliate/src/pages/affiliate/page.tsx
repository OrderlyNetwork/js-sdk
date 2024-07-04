import { Flex, Box, cn } from "@orderly.network/ui";
import { AffiliateProvider } from "../overview/provider";
import { SummaryWidget } from "./summary";
import { ReferralLinkWidget } from "./referralLink";
import { TitleStatisticWidget } from "./titleStatistic";
import { ReferralCodesWidget } from "./referralCodes";
import { CommissionAndRefereesWidget } from "./commissionAndReferees";
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
        <SummaryWidget />
        <ReferralLinkWidget />
        <TitleStatisticWidget />
        <ReferralCodesWidget />
        <CommissionAndRefereesWidget />
       
      </Flex>
    </AffiliateProvider>
  );
};

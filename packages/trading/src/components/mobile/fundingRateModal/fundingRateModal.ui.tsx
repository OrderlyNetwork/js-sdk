import React from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Flex, Text, Divider } from "@kodiak-finance/orderly-ui";
import type { FundingRateModalState } from "./fundingRateModal.script";

export const FundingRateModal: React.FC<FundingRateModalState> = (props) => {
  const { t } = useTranslation();
  const { fundingPeriod, capFunding, floorFunding } = props;
  return (
    <Flex width={"100%"} itemAlign={"center"} direction="column" gap={1}>
      <Flex justify="between" itemAlign={"center"} width={"100%"}>
        <Text intensity={54}>
          {t("trading.fundingRate.predFundingRate.interval")}
        </Text>
        <Text intensity={80}>{fundingPeriod}</Text>
      </Flex>
      <Flex justify="between" itemAlign={"center"} width={"100%"}>
        <Text intensity={54}>
          {t("trading.fundingRate.predFundingRate.cap")} /
          {t("trading.fundingRate.predFundingRate.floor")}
        </Text>
        <Text intensity={80}>
          {capFunding} / {floorFunding}
        </Text>
      </Flex>
      <Divider my={4} className="oui-w-full" intensity={8} />
      {t("markets.symbolInfoBar.predFundingRate.tooltip")}
    </Flex>
  );
};

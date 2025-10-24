import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text, Divider } from "@orderly.network/ui";
import type { FundingRateModalState } from "./fundingRateModal.script";

export const FundingRateModal: React.FC<FundingRateModalState> = (props) => {
  const { t } = useTranslation();
  const {
    fundingPeriod,
    capFunding,
    floorFunding,
    lastFundingRate,
    estFundingRate,
    estFundingFee,
  } = props;

  const renderRow = (label: string, value?: string | number) => {
    if (!value) {
      return null;
    }
    return (
      <Flex justify="between" itemAlign={"center"} width={"100%"}>
        <Text intensity={54}>{label}</Text>
        <Text intensity={80}>{value}</Text>
      </Flex>
    );
  };
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
      {renderRow(t("trading.fundingRate.lastFundingRate"), lastFundingRate)}
      {renderRow(t("trading.fundingRate.estimatedFundingRate"), estFundingRate)}
      {renderRow(t("trading.fundingRate.estimatedFundingFee"), estFundingFee)}
      <Divider my={4} className="oui-w-full" intensity={8} />
      {t("markets.symbolInfoBar.predFundingRate.tooltip")}
    </Flex>
  );
};

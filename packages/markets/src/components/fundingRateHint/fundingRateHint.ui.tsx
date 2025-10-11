import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Divider, Flex, Text } from "@orderly.network/ui";
import { FundingRateHintState } from "./fundingRateHint.script";

export type FundingRateHintProps = FundingRateHintState & {
  className?: string;
  style?: React.CSSProperties;
};

export const FundingRateHint: FC<FundingRateHintProps> = (props) => {
  const { t } = useTranslation();
  const {
    fundingPeriod,
    capFunding,
    floorFunding,
    lastFundingRate,
    estFundingRate,
    edtFundingFee,
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
      {renderRow(
        t("trading.fundingRate.predFundingRate.interval"),
        fundingPeriod,
      )}
      {renderRow(
        t("trading.fundingRate.predFundingRate.cap") +
          " / " +
          t("trading.fundingRate.predFundingRate.floor"),
        capFunding + " / " + floorFunding,
      )}
      {renderRow(t("trading.fundingRate.lastFundingRate"), lastFundingRate)}
      {renderRow(t("trading.fundingRate.estimatedFundingRate"), estFundingRate)}
      {renderRow(t("trading.fundingRate.estimatedFundingFee"), edtFundingFee)}
      <Divider className="oui-w-full" intensity={8} />
      {t("markets.symbolInfoBar.predFundingRate.tooltip")}
    </Flex>
  );
};

import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export const CollateralContributionUI: React.FC<{
  value: number;
  precision: number;
}> = (props) => {
  const { t } = useTranslation();
  const { value, precision } = props;
  return (
    <Flex width="100%" itemAlign="center" justify="between">
      <Flex itemAlign="center" justify="start">
        <Text size="2xs" intensity={36}>
          {t("transfer.deposit.collateralContribution")}
        </Text>
      </Flex>
      <Flex itemAlign="center" justify="end" gap={1}>
        <Text.numeral
          dp={precision}
          size="2xs"
          rm={Decimal.ROUND_DOWN}
          className={cn("oui-font-semibold")}
        >
          {value}
        </Text.numeral>
        <Text size="2xs" intensity={36} className="oui-select-none">
          USDC
        </Text>
      </Flex>
    </Flex>
  );
};

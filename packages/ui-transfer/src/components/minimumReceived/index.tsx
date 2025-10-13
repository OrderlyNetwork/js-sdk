import React from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Flex, Text } from "@kodiak-finance/orderly-ui";

export const MinimumReceived: React.FC<
  Readonly<{ symbol: string; value: number | string; precision: number }>
> = (props) => {
  const { t } = useTranslation();
  const { value, symbol, precision = 6 } = props;

  return (
    <Flex width="100%" itemAlign="center" justify="between">
      <Flex itemAlign="center" justify="start">
        <Text size="2xs" intensity={36}>
          {t("transfer.swapDeposit.minimumReceived")}
        </Text>
      </Flex>
      <Flex itemAlign="center" justify="end" gap={1}>
        <Text.numeral
          dp={precision}
          size="2xs"
          className="oui-select-none"
          intensity={80}
        >
          {value}
        </Text.numeral>
        <Text size="2xs" className="oui-select-none" intensity={36}>
          {symbol}
        </Text>
      </Flex>
    </Flex>
  );
};

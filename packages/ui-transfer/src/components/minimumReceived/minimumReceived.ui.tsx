import React from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text } from "@orderly.network/ui";

export const MinimumReceivedUI: React.FC<
  Readonly<{
    minimumReceived: number;
    symbol: string;
  }>
> = (props) => {
  // const { t } = useTranslation();
  const { minimumReceived, symbol } = props;
  return (
    <Flex width="100%" itemAlign="center" justify="between">
      <Flex itemAlign="center" justify="start">
        <Text size="xs" intensity={36}>
          Minimum received
        </Text>
      </Flex>
      <Flex itemAlign="center" justify="end" gap={1}>
        <Text className="oui-select-none" intensity={80}>
          {minimumReceived}
        </Text>
        <Text className="oui-select-none" intensity={36}>
          {symbol}
        </Text>
      </Flex>
    </Flex>
  );
};

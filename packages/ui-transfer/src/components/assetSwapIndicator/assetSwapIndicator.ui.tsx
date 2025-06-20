import React from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text, TokenIcon } from "@orderly.network/ui";
import type { AssetSwapIndicatorReturns } from "./assetSwapIndicator.script";

export const AssetSwapIndicatorUI: React.FC<
  Readonly<AssetSwapIndicatorReturns>
> = (props) => {
  const { fromToken, toToken } = props;
  return (
    <Flex
      width="100%"
      direction="column"
      itemAlign="center"
      justify="center"
      gap={3}
      mt={5}
    >
      <Flex itemAlign="center" justify="center" gap={1}>
        <Flex itemAlign="center" justify="center" gap={1}>
          <TokenIcon size="xs" name={fromToken} />
          <Text weight="semibold" intensity={80}>
            {fromToken}
          </Text>
        </Flex>
        <Text className="oui-select-none" intensity={36}>
          →
        </Text>
        <Flex itemAlign="center" justify="center" gap={1}>
          <TokenIcon size="xs" name={toToken} />
          <Text weight="semibold" intensity={80}>
            {toToken}
          </Text>
        </Flex>
      </Flex>
      <Text
        size="xs"
        className="oui-text-center oui-text-warning"
        intensity={36}
      >
        Please note that convert fees will be charged.
      </Text>
    </Flex>
  );
};

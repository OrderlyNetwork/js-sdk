import React from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { Flex, Text, TokenIcon } from "@orderly.network/ui";

export const AssetSwapIndicatorUI: React.FC<
  Readonly<Record<"sourceToken" | "targetToken", string>>
> = (props) => {
  const { sourceToken, targetToken } = props;
  if (sourceToken === targetToken) {
    return null;
  }
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
          <TokenIcon size="xs" name={sourceToken} />
          <Text weight="semibold" intensity={80}>
            {sourceToken}
          </Text>
        </Flex>
        <Text className="oui-select-none" intensity={36}>
          →
        </Text>
        <Flex itemAlign="center" justify="center" gap={1}>
          <TokenIcon size="xs" name={targetToken} />
          <Text weight="semibold" intensity={80}>
            {targetToken}
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

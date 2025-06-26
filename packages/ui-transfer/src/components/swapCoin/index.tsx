import { FC } from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { Flex, Text } from "@orderly.network/ui";

interface SwapCoinProps {
  className?: string;
  sourceToken?: API.TokenInfo;
  targetToken?: API.TokenInfo;
  indexPrice: number;
}

export const SwapCoin: FC<SwapCoinProps> = (props) => {
  const { sourceToken, targetToken, indexPrice } = props;

  // const { t } = useTranslation();

  const sourceSymbol = sourceToken?.display_name || sourceToken?.symbol;

  const targetSymbol = targetToken?.display_name || targetToken?.symbol;

  return (
    <Flex width={"100%"} itemAlign="center" justify="between">
      <Text size="xs" intensity={36}>
        Convert rate
      </Text>
      <Flex
        itemAlign="center"
        justify="center"
        gap={1}
        className={props.className}
      >
        <Text size="xs" intensity={80}>
          1
        </Text>
        <Text size="xs" intensity={36}>
          {sourceSymbol}
        </Text>
        =
        <Text.numeral size="xs" intensity={80} dp={4}>
          {indexPrice}
        </Text.numeral>
        <Text size="xs" intensity={36}>
          {targetSymbol}
        </Text>
      </Flex>
    </Flex>
  );
};

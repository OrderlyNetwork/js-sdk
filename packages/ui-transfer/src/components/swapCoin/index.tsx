import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";

interface SwapCoinProps {
  className?: string;
  sourceSymbol?: string;
  targetSymbol?: string;
  indexPrice: number | string;
}

export const SwapCoin: FC<SwapCoinProps> = (props) => {
  const { sourceSymbol, targetSymbol, indexPrice } = props;

  // const { t } = useTranslation();

  return (
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
  );
};

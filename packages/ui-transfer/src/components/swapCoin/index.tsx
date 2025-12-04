import { FC } from "react";
import { cn, Flex, Text } from "@veltodefi/ui";

interface SwapCoinProps {
  className?: string;
  sourceSymbol?: string;
  targetSymbol?: string;
  indexPrice: number | string;
  precision?: number;
}

export const SwapCoin: FC<SwapCoinProps> = (props) => {
  const { sourceSymbol, targetSymbol, indexPrice, precision = 6 } = props;
  return (
    <Flex
      itemAlign="center"
      gap={1}
      className={cn(props.className, "oui-text-2xs")}
    >
      <Text size="2xs" intensity={80}>
        1
      </Text>
      <Text size="2xs" intensity={36}>
        {sourceSymbol}
      </Text>
      =
      <Text.numeral size="2xs" intensity={80} dp={precision} padding={false}>
        {indexPrice}
      </Text.numeral>
      <Text size="2xs" intensity={36}>
        {targetSymbol}
      </Text>
    </Flex>
  );
};

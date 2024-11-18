import {
  ArrowDownShortIcon,
  ArrowUpShortIcon,
  Box,
  cn,
  Flex,
  Text,
} from "@orderly.network/ui";
import { FC } from "react";

/**
 * default style is desktop effect
 */
export const MiddlePriceView: FC<{
  markPrice: number;
  lastPrice: number[];
  quote_dp: number;
  className?: string;
  iconSize?: number;
}> = (props) => {
  const {
    markPrice = 0,
    lastPrice,
    quote_dp,
    className,
    iconSize = 18,
  } = props;

  const [prevLastPrice, middlePrice] = lastPrice;

  const down = middlePrice < prevLastPrice;
  const up = middlePrice > prevLastPrice;

  return (
    <Flex
      gap={1}
      className={cn(
        up ? "oui-text-trade-profit" : down ? "oui-text-trade-loss" : "",
        className
      )}
    >
      <Text.numeral dp={quote_dp} intensity={98}>
        {middlePrice}
      </Text.numeral>
      <Box width={19}>
        {down && (
          <ArrowDownShortIcon size={iconSize} color="danger" opacity={1} />
        )}
        {up && <ArrowUpShortIcon size={iconSize} color="success" opacity={1} />}
      </Box>
    </Flex>
  );
};

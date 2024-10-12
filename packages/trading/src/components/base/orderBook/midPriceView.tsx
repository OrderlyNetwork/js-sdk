import { ArrowDownShortIcon, ArrowUpShortIcon, Box, cn, Flex, Text } from "@orderly.network/ui";
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
  
    return (
      <Flex
        gap={1}
        className={cn(
          middlePrice > prevLastPrice
            ? "oui-text-trade-profit"
            : "oui-text-trade-loss",
          className
        )}
      >
        <Text.numeral dp={quote_dp}>{middlePrice}</Text.numeral>
        <Box width={19}>
          {middlePrice < prevLastPrice && (
            <ArrowDownShortIcon size={iconSize} color="danger" opacity={1} />
          )}
          {middlePrice > prevLastPrice && (
            <ArrowUpShortIcon size={iconSize} color="success" opacity={1} />
          )}
        </Box>
      </Flex>
    );
  };
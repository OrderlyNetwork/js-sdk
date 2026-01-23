import { useMemo } from "react";
import { OrderSide } from "@orderly.network/types";
import { useMarkPrice } from "../../orderly/useMarkPrice";

const useGetEstLiqPrice = (props: {
  estLiqPrice: number | null;
  symbol: string;
  side: OrderSide;
}) => {
  const { estLiqPrice, symbol, side } = props;

  const { data: markPrice } = useMarkPrice(symbol);

  return useMemo(() => {
    if (!estLiqPrice || !markPrice) {
      return null;
    }

    // long: 大于当前的 Mark price 不显示 est. liq price
    // short: 小于当前的 Mark price 不显示 est. liq price
    if (side === OrderSide.BUY && estLiqPrice > markPrice) {
      return null;
    }
    if (side === OrderSide.SELL && estLiqPrice < markPrice) {
      return null;
    }

    return estLiqPrice;
  }, [estLiqPrice, markPrice, side]);
};

export { useGetEstLiqPrice };

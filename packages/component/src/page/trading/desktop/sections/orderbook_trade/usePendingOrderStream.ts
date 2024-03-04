import { useSymbolContext } from "@/provider/symbolProvider";
import { useOrderStream } from "@orderly.network/hooks";
import { OrderStatus } from "@orderly.network/types";
import { useMemo } from "react";

export const usePendingOrderStream = (symbol: string): number[] => {
  const [data] = useOrderStream({
    status: OrderStatus.INCOMPLETE,
    symbol: symbol,
  });

  const pendingOrders = useMemo(() => {
    const info = data
      ?.filter((item) => item.symbol === symbol)
      .reduce((a, b) => {
        // TODO: check if this is the correct price, when the data is from WS, it crashes
        const price = b.price || b.trigger_price || 0;
        return [...a, price];
      }, []);

    return info;
  }, [data, symbol]);

  return pendingOrders;
};

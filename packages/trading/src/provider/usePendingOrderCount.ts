import { useOrderStream } from "@orderly.network/hooks";
import { useTradingLocalStorage } from "./useTradingLocalStorage";
import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { useMemo } from "react";

export const usePendingOrderCount = (symbol?: string) => {
  const { showAllSymbol } = useTradingLocalStorage();

  const [data] = useOrderStream({
    symbol: showAllSymbol ? undefined : symbol,
    status: OrderStatus.INCOMPLETE,
  });

  const pendingOrderCount = useMemo(() => {
    const excludes = [
      AlgoOrderRootType.POSITIONAL_TP_SL,
      AlgoOrderRootType.TP_SL,
    ];
    return data?.filter((item) => !excludes.includes(item.algo_type))?.length;
  }, [data]);

  const tpSlOrderCount = useMemo(() => {
    const includes = [
      AlgoOrderRootType.POSITIONAL_TP_SL,
      AlgoOrderRootType.TP_SL,
    ];
    return data?.filter((item) => includes.includes(item.algo_type))?.length;
  }, [data]);

  return {
    pendingOrderCount,
    tpSlOrderCount,
  };
};

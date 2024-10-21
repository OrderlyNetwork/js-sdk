import { useOrderStream } from "@orderly.network/hooks";
import { useTradingLocalStorage } from "./useTradingLocalStorage";
import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";

export const usePendingOrderCount = (symbol?: string) => {
  const { showAllSymbol } = useTradingLocalStorage();

  const [_, { total: pendingCount }] = useOrderStream(
    {
      symbol: showAllSymbol ? undefined: symbol,
      status: OrderStatus.INCOMPLETE,
      excludes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
    },
    {
      keeplive: true,
    }
  );

  const [__, { total: tpslCount }] = useOrderStream(
    {
      symbol: showAllSymbol ? undefined: symbol,
      status: OrderStatus.INCOMPLETE,
      includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
    },
    {
      keeplive: true,
    }
  );

  return {
    pendingOrderCount: pendingCount,
    tpSlOrderCount: tpslCount,
  };
};

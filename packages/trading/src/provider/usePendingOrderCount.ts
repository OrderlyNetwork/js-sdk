import { useOrderStream } from "@orderly.network/hooks";
import { useTradingLocalStorage } from "./useTradingLocalStorage";
import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { useMemo } from "react";

export const usePendingOrderCount = (symbol?: string) => {
  const { showAllSymbol } = useTradingLocalStorage();

  const [_, { total: pendingCount }] = useOrderStream(
    {
      status: OrderStatus.INCOMPLETE,
      excludes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
    },
    {
      keeplive: true,
    }
  );

  const [__, { total: tpslCount }] = useOrderStream(
    {
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

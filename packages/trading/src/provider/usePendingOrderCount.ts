import { useLocalStorage, useOrderStream } from "@orderly.network/hooks";
import { useTradingLocalStorage } from "./useTradingLocalStorage";
import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { useEffect, useMemo } from "react";
import { TabType } from "@orderly.network/ui-orders";
import { useDataTap } from "@orderly.network/react-app";

export const usePendingOrderCount = (symbol?: string) => {
  const { showAllSymbol } = useTradingLocalStorage();

  const pendingOrdersPageSizeKey = `orderly_${TabType.pending}_pageSize`;
  const tpslOrdersPageSizeKey = `orderly_${TabType.tp_sl}_pageSize`;
  // 
  // const [pendingOrderPageSize] = useLocalStorage(pendingOrdersPageSizeKey, 500);
  // const [tpslOrderPageSize] = useLocalStorage(tpslOrdersPageSizeKey, 500);

  const [pendingOrders, { total: pendingCount }] = useOrderStream(
    {
      symbol: showAllSymbol ? undefined : symbol,
      status: OrderStatus.INCOMPLETE,
      excludes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
      // size: pendingOrderPageSize,
      // size: 500,
    },
    {
      keeplive: true,
    }
  );

  const [tpslOrders, { total: tpslCount }] = useOrderStream(
    {
      symbol: showAllSymbol ? undefined : symbol,
      status: OrderStatus.INCOMPLETE,
      includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
      // size: tpslOrderPageSize,
      // size: 500,
    },
    {
      keeplive: true,
    }
  );

  const pendingOrderCount = useDataTap(pendingCount) ?? 0;
  const tpSlOrderCount = useDataTap(tpslCount) ?? 0;

  return {
    pendingOrderCount,
    tpSlOrderCount,
  };
};

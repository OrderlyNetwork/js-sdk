import { useLocalStorage, useOrderStream } from "@orderly.network/hooks";
import { useTradingLocalStorage } from "./useTradingLocalStorage";
import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { useEffect, useMemo } from "react";
import { TabType } from "@orderly.network/ui-orders";
import { useDataTap } from "@orderly.network/react-app";

export const usePendingOrderCount = (symbol?: string) => {
  const { showAllSymbol } = useTradingLocalStorage();

  const pendingOrdersPageSizeKey = `oui-${TabType.pending}_pageSize`;
  const tpslOrdersPageSizeKey = `oui-${TabType.tp_sl}_pageSize`;
  const [pendingOrderPageSize] = useLocalStorage(pendingOrdersPageSizeKey, 50);
  const [tpslOrderPageSize] = useLocalStorage(tpslOrdersPageSizeKey, 50);

  const [pendingOrders, { total: pendingCount }] = useOrderStream(
    {
      symbol: showAllSymbol ? undefined : symbol,
      status: OrderStatus.INCOMPLETE,
      excludes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
      size: pendingOrderPageSize,
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
      size: tpslOrderPageSize,
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

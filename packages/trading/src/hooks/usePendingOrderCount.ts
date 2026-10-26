import { useMemo } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import { useDataTap } from "@orderly.network/react-app";
import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { isBinarySymbol } from "@orderly.network/utils";
import { useTradingLocalStorage } from "./useTradingLocalStorage";

export const usePendingOrderCount = (symbol?: string) => {
  const { showAllSymbol } = useTradingLocalStorage();

  // const pendingOrdersPageSizeKey = `orderly_${TabType.pending}_pageSize`;
  // const tpslOrdersPageSizeKey = `orderly_${TabType.tp_sl}_pageSize`;

  // const [pendingOrderPageSize] = useLocalStorage(pendingOrdersPageSizeKey, 500);
  // const [tpslOrdersPageSize] = useLocalStorage(tpslOrdersPageSizeKey, 500);

  const [pendingOrders] = useOrderStream(
    {
      symbol: showAllSymbol ? undefined : symbol,
      status: OrderStatus.INCOMPLETE,
      productType: "PERP",
      excludes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
      // size: pendingOrderPageSize,
      size: 500,
      // sourceTypeAll: true,
    },
    {
      keeplive: true,
    },
  );

  const [tpslOrders] = useOrderStream(
    {
      symbol: showAllSymbol ? undefined : symbol,
      status: OrderStatus.INCOMPLETE,
      includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
      // size: tpslOrdersPageSize,
      size: 500,
      // sourceTypeAll: true,
    },
    {
      keeplive: true,
    },
  );

  const pendingCount = useMemo(() => {
    if (showAllSymbol) {
      // Binary rows never appear here from REST (product_type=PERP), but the
      // executionreport WS inserts into every orders* cache key, so guard the
      // count against cross-product leaks.
      return (
        pendingOrders?.filter((item) => !isBinarySymbol(item.symbol ?? ""))
          .length ?? 0
      );
    }
    return pendingOrders?.filter((item) => item.symbol === symbol)?.length ?? 0;
  }, [pendingOrders, showAllSymbol, symbol]);

  const tpslCount = useMemo(() => {
    if (showAllSymbol) {
      return tpslOrders?.length ?? 0;
    }
    return tpslOrders?.filter((item) => item.symbol === symbol)?.length ?? 0;
  }, [tpslOrders, showAllSymbol, symbol]);

  const pendingOrderCount = useDataTap(pendingCount) ?? 0;
  const tpSlOrderCount = useDataTap(tpslCount) ?? 0;

  return {
    pendingOrderCount,
    tpSlOrderCount,
  };
};

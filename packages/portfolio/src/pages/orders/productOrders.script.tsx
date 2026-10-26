import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { useAccount } from "@orderly.network/hooks";
import {
  binaryOrderDisplaySide,
  binaryOrderDisplayStatus,
  binaryOrderPlainText,
  toPredictionOrderStatus,
  useBinaryOrderRows,
  usePredictionAccountData,
  useProductOrderCancelAll,
  type ProductOrderInstrument,
} from "@orderly.network/prediction";
import { useCanTrade } from "@orderly.network/react-app";
import { OrderStatus, type API } from "@orderly.network/types";
import {
  TabType,
  useOrderListScript,
  type OrderListInstance,
} from "@orderly.network/ui-orders";
import type { SharePnLConfig } from "@orderly.network/ui-share";
import { isBinarySymbol } from "@orderly.network/utils";

export type ProductOrdersProps = {
  type: TabType;
  ordersStatus?: OrderStatus;
  product: ProductOrderInstrument;
  ordersRef: React.RefObject<OrderListInstance>;
  sharePnLConfig?: SharePnLConfig;
  onSymbolChange?: (symbol: API.Symbol) => void;
  onPredictionSelect?: (symbol: string) => void;
};

export function useProductOrdersScript({
  type,
  ordersStatus,
  product,
  ordersRef,
  sharePnLConfig,
  onSymbolChange,
  onPredictionSelect,
}: ProductOrdersProps) {
  const { state: account } = useAccount();
  const canTrade = useCanTrade();
  const pending = type === TabType.pending;
  const includePrediction = product !== "perps" && type !== TabType.tp_sl;
  const state = usePredictionAccountData({ enabled: includePrediction });
  const cancellation = useProductOrderCancelAll({
    binary: product === "perps" ? undefined : state,
    enabled: pending,
    instrument: product,
  });
  const perps = useOrderListScript({
    onSymbolChange,
    type,
    ordersStatus,
    ref: ordersRef,
    sharePnLConfig,
    productType: "PERP",
    enabled: product !== "prediction",
    enableLoadMore: includePrediction,
    cancelAllDisabled: pending ? cancellation.disabled : undefined,
  });
  const binary = useBinaryOrderRows({
    enabled: includePrediction && canTrade,
    mode: pending ? "pending" : type === TabType.filled ? "filled" : "history",
    status: perps.orderStatus,
    side: perps.ordersSide,
    dateRange: perps.dateRange,
  });
  const filterItems = perps.filterItems;
  const perpsRows = useMemo(() => {
    const rows = product === "prediction" ? [] : (perps.dataSource ?? []);
    return Array.from(
      new Map(
        rows
          .filter((order) => !isBinarySymbol(order.symbol))
          .map((order) => [
            order.algo_order_id
              ? `algo-${order.algo_order_id}`
              : `order-${order.order_id}`,
            order,
          ]),
      ).values(),
    );
  }, [product, perps.dataSource]);
  const predictionOrders = useMemo(() => {
    if (!includePrediction || !canTrade) return [];
    return Array.from(
      new Map(
        binary.rows
          .filter((order) =>
            filterItems.every((filter) => {
              const value = filter.value;
              if (!value || value === "all") return true;
              if (filter.name === "side")
                return (
                  binaryOrderDisplaySide(order).toUpperCase() ===
                  String(value).toUpperCase()
                );
              if (filter.name === "status") {
                const status = toPredictionOrderStatus(value);
                const displayStatus = binaryOrderDisplayStatus(order);
                return (
                  status === "all" ||
                  displayStatus === status ||
                  (status === "pending" && displayStatus === "partialFilled")
                );
              }
              if (filter.name === "dateRange") {
                const range = value as { from?: Date; to?: Date };
                return (
                  (!range.from ||
                    order.created_time >= new Date(range.from).getTime()) &&
                  (!range.to ||
                    order.created_time <= new Date(range.to).getTime())
                );
              }
              return true;
            }),
          )
          .map((order) => [order.order_id, order]),
      ).values(),
    );
  }, [binary.rows, includePrediction, canTrade, filterItems]);
  const scope = JSON.stringify([
    account.accountId,
    product,
    type,
    filterItems.map((item) => [item.name, item.value]),
  ]);
  const [paginationRequest, setPaginationRequest] = useState({
    scope,
    page: 1,
  });
  const page = paginationRequest.scope === scope ? paginationRequest.page : 1;
  const [pageSize, setPageSize] = useState(20);
  const perpsHasMore = product !== "prediction" && perps.hasMore;
  useEffect(() => {
    if (!includePrediction || !canTrade) return;
    if (
      perpsHasMore &&
      perpsRows.length <= page * pageSize &&
      !perps.isLoading &&
      !perps.isValidating &&
      !perps.error
    ) {
      perps.loadMore();
    }
    if (
      binary.hasMore &&
      predictionOrders.length <= page * pageSize &&
      !binary.isLoading &&
      !binary.isValidating &&
      !binary.error
    ) {
      binary.loadMore();
    }
  }, [
    includePrediction,
    canTrade,
    page,
    pageSize,
    perpsHasMore,
    perpsRows.length,
    perps.isLoading,
    perps.isValidating,
    perps.error,
    perps.loadMore,
    binary.hasMore,
    binary.isLoading,
    binary.isValidating,
    binary.error,
    binary.loadMore,
    predictionOrders.length,
  ]);

  return {
    state: { ...state, onSelectRoundSymbol: onPredictionSelect },
    orders: predictionOrders,
    plainText: binaryOrderPlainText,
    error: (product !== "prediction" && perps.error) || binary.error,
    orderListProps: {
      ...perps,
      filterItems,
      dataSource: perpsRows,
      isLoading:
        (product !== "prediction" && perps.isLoading) || binary.isLoading,
      isValidating:
        (product !== "prediction" && perps.isValidating) || binary.isValidating,
      mergeProducts: includePrediction,
      mergedTotal: perpsRows.length + predictionOrders.length,
      mergedPageSize: pageSize,
      mergeResetKey: scope,
      onMergedPageSizeChange: (pageSize: number) => {
        setPageSize(pageSize);
        setPaginationRequest({ scope, page: 1 });
      },
      onMergedPageChange: (page: number) =>
        setPaginationRequest({ scope, page }),
      ...(pending ? cancellation.orderListProps : {}),
    },
  };
}

export type ProductOrdersState = ReturnType<typeof useProductOrdersScript>;

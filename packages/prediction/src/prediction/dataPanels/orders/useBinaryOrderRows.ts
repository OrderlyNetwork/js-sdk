import { useMemo } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { isBinarySymbol } from "../../binary/binaryInfo";
import { matchesPredictionUnderlying } from "../../binary/productScope";
import { toPredictionOrder } from "../../hooks/usePredictionPortfolio";
import type {
  PredictionOpenOrder,
  PredictionTrade,
} from "../../prediction.types";
import type { ProductOrderMode } from "../sharedProductOrdersPanel.script";

const predictionStatus = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.FILLED:
      return "filled" as const;
    case OrderStatus.CANCELLED:
      return "cancelled" as const;
    case OrderStatus.REJECTED:
      return "rejected" as const;
    case OrderStatus.PARTIAL_FILLED:
      return "partialFilled" as const;
    default:
      return "pending" as const;
  }
};

export const useBinaryOrderRows = ({
  mode,
  status,
  side,
  dateRange,
  underlyingSymbol,
}: {
  mode: ProductOrderMode;
  status?: OrderStatus;
  side?: OrderSide;
  dateRange?: { from?: Date; to?: Date };
  underlyingSymbol?: string;
}) => {
  const [rawOrders, stream] = useOrderStream({
    productType: "BINARY",
    sourceTypeAll: mode !== "pending",
    status:
      mode === "pending"
        ? OrderStatus.INCOMPLETE
        : mode === "filled"
          ? OrderStatus.FILLED
          : status,
    side,
    dateRange: mode === "history" ? dateRange : undefined,
    size: 50,
  });
  const rows = useMemo<(PredictionOpenOrder | PredictionTrade)[]>(
    () =>
      (rawOrders ?? [])
        .filter(
          (order) =>
            !order.algo_order_id &&
            isBinarySymbol(order.symbol) &&
            matchesPredictionUnderlying(order.symbol, underlyingSymbol),
        )
        .map((order) => ({
          ...toPredictionOrder(order),
          status: predictionStatus(order.status),
        })),
    [rawOrders, underlyingSymbol],
  );
  const fetchedCount = rawOrders?.length ?? 0;
  const total = stream.meta?.total ?? 0;
  return {
    rows,
    total,
    hasMore: fetchedCount < total,
    loadMore: stream.loadMore,
    isLoading: stream.isLoading,
    isValidating: stream.isValidating,
  };
};

import { useMemo } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import { normalizePredictionOrders } from "../../binary/binaryOrderDisplay";
import type { PredictionOpenOrder } from "../../prediction.types";
import type { ProductOrderMode } from "../sharedProductOrdersPanel.script";

export interface BinaryOrderRowsOptions {
  enabled?: boolean;
  mode: ProductOrderMode;
  status?: OrderStatus;
  side?: OrderSide;
  dateRange?: { from?: Date; to?: Date };
  underlyingSymbol?: string;
}
export interface BinaryOrderRowsState {
  rows: PredictionOpenOrder[];
  total: number;
  hasMore: boolean;
  loadMore(): void;
  isLoading: boolean;
  isValidating: boolean;
}

export const useBinaryOrderRows = ({
  mode,
  status,
  side,
  dateRange,
  underlyingSymbol,
  enabled = true,
}: BinaryOrderRowsOptions): BinaryOrderRowsState => {
  // Filled mirrors the perps tab's server-side FILLED filter; partially filled
  // IOC orders (terminal CANCELLED with executions) are therefore excluded
  // here but included in the prediction panel's Filled tab (filledQuantity > 0).
  const [rawOrders, stream] = useOrderStream(
    {
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
    },
    { enabled, stopOnUnmount: true },
  );
  const rows = useMemo<PredictionOpenOrder[]>(
    () =>
      enabled
        ? normalizePredictionOrders(rawOrders ?? [], underlyingSymbol)
        : [],
    [rawOrders, underlyingSymbol, enabled],
  );
  const fetchedCount = rawOrders?.length ?? 0;
  const total = stream.meta?.total ?? 0;
  return {
    rows,
    total: enabled ? total : 0,
    hasMore: enabled && fetchedCount < total,
    loadMore: stream.loadMore,
    isLoading: enabled && !!stream.isLoading,
    isValidating: enabled && !!stream.isValidating,
  };
};

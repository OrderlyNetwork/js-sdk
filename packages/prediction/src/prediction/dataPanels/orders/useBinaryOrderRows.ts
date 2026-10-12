import { useMemo } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import { OrderSide, OrderStatus } from "@orderly.network/types";
import {
  hasPredictionExecutions,
  normalizePredictionOrders,
} from "../../binary/binaryOrderDisplay";
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
  error?: unknown;
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
  // Filled uses "has executions" semantics (hasPredictionExecutions): a MARKET
  // submit is a protected-price IOC whose unfilled remainder terminates as
  // CANCELLED, so a server-side FILLED filter would hide executed records.
  // The query therefore fetches all statuses and filters client-side, the same
  // pattern as usePredictionOrderHistory; perps rows in the merged view keep
  // the stock server-side FILLED semantics — a deliberate per-product rule.
  const [rawOrders, stream] = useOrderStream(
    {
      productType: "BINARY",
      sourceTypeAll: mode !== "pending",
      status:
        mode === "pending"
          ? OrderStatus.INCOMPLETE
          : mode === "filled"
            ? undefined
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
        ? normalizePredictionOrders(rawOrders ?? [], underlyingSymbol).filter(
            (order) => mode !== "filled" || hasPredictionExecutions(order),
          )
        : [],
    [rawOrders, underlyingSymbol, enabled, mode],
  );
  const fetchedCount = rawOrders?.length ?? 0;
  const total = stream.meta?.total ?? 0;
  return {
    rows,
    total: enabled ? total : 0,
    hasMore: enabled && stream.hasMore !== false && fetchedCount < total,
    loadMore: stream.loadMore,
    error: enabled ? stream.error : undefined,
    isLoading: enabled && !!stream.isLoading,
    isValidating: enabled && !!stream.isValidating,
  };
};

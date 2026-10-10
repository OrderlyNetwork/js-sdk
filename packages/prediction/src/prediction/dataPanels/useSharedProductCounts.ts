import { useMemo } from "react";
import { useOrderStream, usePositions } from "@orderly.network/hooks";
import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { isBinarySymbol } from "../binary/binaryInfo";
import { matchesPredictionUnderlying } from "../binary/productScope";
import { useBinaryPendingOrders } from "../hooks/useBinaryPendingOrders";
import type { ProductOrderInstrument } from "./productOrderCancellation";

export interface UseSharedProductCountsOptions {
  product?: ProductOrderInstrument;
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
  enabled?: boolean;
}
export interface SharedProductCountsState {
  positions: number;
  pending: number | null;
}

/** Counts depend only on product/symbol scope, never page selection. */
export const useSharedProductCounts = ({
  product = "all",
  perpsSymbol,
  predictionUnderlyingSymbol,
  enabled = true,
}: UseSharedProductCountsOptions = {}): SharedProductCountsState => {
  const positions = usePositions();
  const includePerps = enabled && product !== "prediction";
  const includePrediction = enabled && product !== "perps";
  const [perpsPending] = useOrderStream(
    {
      productType: "PERP",
      status: OrderStatus.INCOMPLETE,
      size: 500,
      symbol: perpsSymbol,
      excludes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
    },
    { enabled: includePerps, stopOnUnmount: true },
  );
  const { orders: predictionPending, complete } =
    useBinaryPendingOrders(includePrediction);
  return useMemo(
    () => ({
      positions: (positions ?? []).filter(
        (row) =>
          row.position_qty !== 0 &&
          (isBinarySymbol(row.symbol)
            ? includePrediction &&
              matchesPredictionUnderlying(
                row.symbol,
                predictionUnderlyingSymbol,
              )
            : includePerps && (!perpsSymbol || row.symbol === perpsSymbol)),
      ).length,
      pending:
        includePrediction && !complete
          ? null
          : (includePerps
              ? (perpsPending ?? []).filter(
                  (row) =>
                    !isBinarySymbol(row.symbol) &&
                    (!perpsSymbol || row.symbol === perpsSymbol),
                ).length
              : 0) +
            (includePrediction
              ? (predictionPending ?? []).filter(
                  (row) =>
                    isBinarySymbol(row.symbol) &&
                    matchesPredictionUnderlying(
                      row.symbol,
                      predictionUnderlyingSymbol,
                    ),
                ).length
              : 0),
    }),
    [
      positions,
      perpsPending,
      predictionPending,
      includePrediction,
      includePerps,
      complete,
      perpsSymbol,
      predictionUnderlyingSymbol,
    ],
  );
};

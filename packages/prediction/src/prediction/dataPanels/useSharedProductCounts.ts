import { useEffect, useMemo } from "react";
import { useOrderStream, usePositionStream } from "@orderly.network/hooks";
import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { isBinarySymbol } from "../binary/binaryInfo";
import { matchesPredictionUnderlying } from "../binary/productScope";
import type { ProductOrderInstrument } from "./productOrderCancellation";

/** Counts depend only on product/symbol scope, never page selection. */
export const useSharedProductCounts = ({
  product = "all",
  perpsSymbol,
  predictionUnderlyingSymbol,
  enabled = true,
}: {
  product?: ProductOrderInstrument;
  perpsSymbol?: string;
  predictionUnderlyingSymbol?: string;
  enabled?: boolean;
} = {}) => {
  const [positionData] = usePositionStream();
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
    { enabled: includePerps },
  );
  const [predictionPending, stream] = useOrderStream(
    { productType: "BINARY", status: OrderStatus.INCOMPLETE, size: 100 },
    { enabled: includePrediction },
  );
  const total = stream.meta?.total;
  const loaded = predictionPending?.length ?? 0;
  const complete =
    Number.isInteger(total) &&
    total! >= 0 &&
    loaded >= total! &&
    !stream.error &&
    !stream.isValidating &&
    !stream.isLoading;
  useEffect(() => {
    if (
      includePrediction &&
      total != null &&
      loaded < total &&
      !stream.error &&
      stream.hasMore !== false &&
      !stream.isValidating
    )
      stream.loadMore();
  }, [
    includePrediction,
    total,
    loaded,
    stream.error,
    stream.hasMore,
    stream.isValidating,
    stream.loadMore,
  ]);
  return useMemo(
    () => ({
      positions: (positionData?.rows ?? []).filter(
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
      positionData?.rows,
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

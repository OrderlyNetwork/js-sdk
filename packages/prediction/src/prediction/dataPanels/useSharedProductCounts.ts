import { useEffect, useMemo } from "react";
import { useOrderStream, usePositionStream } from "@orderly.network/hooks";
import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { isBinarySymbol } from "../binary/binaryInfo";
import { matchesPredictionUnderlying } from "../binary/productScope";
import type { PredictionState } from "../prediction.script";

export const useSharedProductCounts = (
  state: PredictionState | null,
  perpsSymbol?: string,
  predictionUnderlyingSymbol?: string,
) => {
  const [positionData] = usePositionStream();
  const [perpsPending, perpsPendingStream] = useOrderStream({
    productType: "PERP",
    status: OrderStatus.INCOMPLETE,
    size: 500,
    symbol: perpsSymbol,
    excludes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
  });
  const [predictionPending, predictionPendingStream] = useOrderStream({
    productType: "BINARY",
    status: OrderStatus.INCOMPLETE,
    size: 100,
  });
  const predictionTotal = predictionPendingStream.meta?.total;
  const predictionLoaded = predictionPending?.length ?? 0;
  const predictionScanComplete =
    predictionTotal !== undefined && predictionLoaded >= predictionTotal;

  useEffect(() => {
    if (
      predictionUnderlyingSymbol &&
      predictionTotal !== undefined &&
      predictionLoaded < predictionTotal &&
      !predictionPendingStream.isValidating
    ) {
      predictionPendingStream.loadMore();
    }
  }, [
    predictionUnderlyingSymbol,
    predictionTotal,
    predictionLoaded,
    predictionPendingStream.isValidating,
    predictionPendingStream.loadMore,
  ]);

  return useMemo(() => {
    const perpsPositions = (positionData?.rows ?? []).filter(
      (item) =>
        !isBinarySymbol(item.symbol) &&
        (!perpsSymbol || item.symbol === perpsSymbol) &&
        item.position_qty !== 0,
    ).length;
    const predictionPositions = (state?.positions ?? []).filter((item) =>
      matchesPredictionUnderlying(item.symbol, predictionUnderlyingSymbol),
    ).length;
    const perpsOrders = (perpsPending ?? []).filter(
      (item) =>
        !isBinarySymbol(item.symbol) &&
        (!perpsSymbol || item.symbol === perpsSymbol),
    );
    const perpsAlgoCount = perpsOrders.filter(
      (item) => item.algo_order_id !== undefined,
    ).length;
    const perpsOrderCount =
      (perpsPendingStream.meta?.total ?? perpsOrders.length - perpsAlgoCount) +
      perpsAlgoCount;
    const predictionOrders = (predictionPending ?? []).filter(
      (item) =>
        isBinarySymbol(item.symbol) &&
        matchesPredictionUnderlying(item.symbol, predictionUnderlyingSymbol),
    ).length;
    return {
      positions: perpsPositions + predictionPositions,
      pending:
        predictionUnderlyingSymbol && !predictionScanComplete
          ? null
          : perpsOrderCount +
            (predictionUnderlyingSymbol
              ? predictionOrders
              : (predictionTotal ?? predictionOrders)),
    };
  }, [
    positionData?.rows,
    perpsPending,
    perpsPendingStream.meta?.total,
    predictionPending,
    predictionTotal,
    predictionScanComplete,
    state?.positions,
    perpsSymbol,
    predictionUnderlyingSymbol,
  ]);
};

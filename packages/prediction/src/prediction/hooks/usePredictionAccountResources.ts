import { useCallback, useMemo } from "react";
import {
  useAccount,
  useCollateral,
  useMarkPricesStream,
  usePositions,
  usePrivateQuery,
} from "@orderly.network/hooks";
import { AccountStatusEnum, OrderSide, type API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import {
  availableBinaryCloseQuantity,
  resolveBinaryCollateral,
} from "../binary/binaryCollateral";
import { binaryRoundFromSymbol, isBinarySymbol } from "../binary/binaryInfo";
import { normalizePredictionOrders } from "../binary/binaryOrderDisplay";
import { complementPrice } from "../binary/binaryOrderRules";
import type { UsePredictionAccountDataOptions } from "../prediction.types";
import {
  type PredictionOutcome,
  type PredictionPosition,
} from "../prediction.types";
import { useBinaryPendingOrders } from "./useBinaryPendingOrders";
import { usePredictionOrderHistory } from "./usePredictionOrderHistory";
import { usePredictionSettlementHistory } from "./usePredictionSettlementHistory";

export const usePredictionAccountResources = ({
  enabled: active = true,
  includeOrderHistory = false,
  includeSettlementHistory = false,
  nowMs,
}: UsePredictionAccountDataOptions & { nowMs?: number } = {}) => {
  const { state: accountState } = useAccount();
  const accountReady =
    active &&
    !!accountState.accountId &&
    (accountState.status >= AccountStatusEnum.EnableTrading ||
      accountState.status === AccountStatusEnum.EnableTradingWithoutConnected);
  const { freeCollateral } = useCollateral({ dp: 6 });
  // Available collateral in USDC, including account-level funding constraints.
  const balance =
    accountReady && Number.isFinite(freeCollateral)
      ? Math.max(0, freeCollateral)
      : 0;
  const {
    orders: pendingOrdersData,
    stream: pendingOrdersStream,
    complete: pendingOrdersComplete,
  } = useBinaryPendingOrders(active && accountReady);
  const { history, allOrdersStream } = usePredictionOrderHistory(
    active && accountReady && includeOrderHistory,
  );
  const openOrders = useMemo(
    () =>
      accountReady ? normalizePredictionOrders(pendingOrdersData ?? []) : [],
    [pendingOrdersData, accountReady],
  );
  const positionRows = usePositions();
  // Share the account-scoped observer cache without dropping pending-only rows.
  const {
    data: accountPositions,
    mutate: refreshAccountPositions,
    isLoading: positionsLoading,
    error: positionsError,
  } = usePrivateQuery<API.PositionInfo>(
    active && accountReady ? "/v1/positions" : null,
    {
      formatter: (data) => data,
      keepPreviousData: false,
    },
  );
  const { data: markPrices } = useMarkPricesStream();
  const getCollateralSnapshot = useCallback(
    (symbol?: string) =>
      resolveBinaryCollateral({
        symbol,
        positions: accountPositions?.rows,
        orders: pendingOrdersData,
        ordersComplete: pendingOrdersComplete,
        markPrice: symbol ? markPrices?.[symbol] : undefined,
      }),
    [accountPositions, markPrices, pendingOrdersComplete, pendingOrdersData],
  );
  /**
   * Every open binary position across rounds (TASK-38: the frontend keeps the
   * symbol↔product map — the positions response carries no product_type).
   */
  const positions = useMemo<PredictionPosition[]>(
    () =>
      (accountReady ? (positionRows ?? []) : [])
        .filter(
          (row) =>
            isBinarySymbol(row.symbol) &&
            typeof row.position_qty === "number" &&
            row.position_qty !== 0,
        )
        .map((row) => ({
          outcome: row.position_qty > 0 ? ("up" as const) : ("down" as const),
          quantity: Math.abs(row.position_qty),
          averagePrice:
            row.position_qty > 0
              ? row.average_open_price
              : complementPrice(row.average_open_price),
          symbol: row.symbol,
          round: binaryRoundFromSymbol(row.symbol) ?? undefined,
        })),
    [positionRows, accountReady],
  );
  const availableQuantity = useCallback(
    (outcome: PredictionOutcome, excludeId?: number, symbol?: string) => {
      return availableBinaryCloseQuantity(
        getCollateralSnapshot(symbol),
        outcome === "up" ? OrderSide.SELL : OrderSide.BUY,
        excludeId,
      );
    },
    [getCollateralSnapshot],
  );
  const settlementHistory = usePredictionSettlementHistory({
    accountId: accountState.accountId,
    enabled: active && accountReady,
    includeSettlementHistory: includeSettlementHistory,
    positions,
    seedPositions: accountPositions?.rows,
    nowMs,
  });
  return {
    accountState,
    accountReady,
    ordersLoading: pendingOrdersStream.isLoading,
    ordersError: pendingOrdersStream.error,
    positionsLoading,
    positionsError,
    balance,
    positions,
    openOrders,
    pendingOrdersComplete,
    history,
    ...settlementHistory,
    availableQuantity,
    getCollateralSnapshot,
    pendingOrdersStream,
    allOrdersStream,
    refreshAccountPositions,
  };
};
export type PredictionAccountResources = ReturnType<
  typeof usePredictionAccountResources
>;

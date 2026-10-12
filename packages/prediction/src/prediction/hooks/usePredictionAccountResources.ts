import { useCallback, useMemo } from "react";
import {
  useAccount,
  useCollateral,
  useMarkPricesStream,
  usePositions,
  usePrivateQuery,
} from "@orderly.network/hooks";
import { AccountStatusEnum, OrderSide, type API } from "@orderly.network/types";
import {
  availableBinaryCloseQuantity,
  resolveBinaryCollateral,
} from "../binary/binaryCollateral";
import { binaryRoundFromSymbol, isBinarySymbol } from "../binary/binaryInfo";
import { toPredictionPosition } from "../binary/binaryManagedPositions";
import { normalizePredictionOrders } from "../binary/binaryOrderDisplay";
import type { UsePredictionAccountDataOptions } from "../prediction.types";
import {
  type PredictionOutcome,
  type PredictionPosition,
} from "../prediction.types";
import { useBinaryPendingOrders } from "./useBinaryPendingOrders";
import { usePredictionOrderHistory } from "./usePredictionOrderHistory";
import { usePredictionSettlementHistory } from "./usePredictionSettlementHistory";
import { usePredictionTargetResources } from "./usePredictionTargetResources";

export const usePredictionAccountResources = ({
  enabled: active = true,
  includeOrderHistory = false,
  includeSettlementHistory = false,
  nowMs,
  accountId: targetAccountId,
}: UsePredictionAccountDataOptions & {
  nowMs?: number;
  accountId?: string;
} = {}) => {
  const { state: accountState } = useAccount();
  const foreign =
    !!targetAccountId && targetAccountId !== accountState.accountId;
  const target = usePredictionTargetResources(
    foreign ? targetAccountId : undefined,
    active && foreign,
  );
  const currentActive = active && !foreign;
  const accountReady =
    currentActive &&
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
  } = useBinaryPendingOrders(currentActive && accountReady);
  const { history, allOrdersStream } = usePredictionOrderHistory(
    currentActive && accountReady && includeOrderHistory,
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
    currentActive && accountReady ? "/v1/positions" : null,
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
        .map((row) => toPredictionPosition(row, accountState.accountId)),
    [positionRows, accountReady, accountState.accountId],
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
    enabled: currentActive && accountReady,
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
    targetAccountId: undefined as string | undefined,
    targetAuthorized: true,
    feeRates: undefined as typeof target.feeRates | undefined,
    refreshForSubmission: undefined as
      | typeof target.refreshForSubmission
      | undefined,
    canSubmit: undefined as typeof target.canSubmit | undefined,
    refreshOrders: undefined as typeof target.refreshOrders | undefined,
    ...(foreign ? target : {}),
  };
};
export type PredictionAccountResources = ReturnType<
  typeof usePredictionAccountResources
>;

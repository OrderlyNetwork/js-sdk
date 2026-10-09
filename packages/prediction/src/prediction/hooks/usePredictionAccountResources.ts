import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useSWRConfig } from "@orderly.network/hooks";
import {
  useAccount,
  useCollateral,
  useMarkPricesStream,
  useMemoizedFn,
  useOrderStream,
  usePositionStream,
  usePrivateQuery,
} from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  OrderSide,
  OrderStatus,
  type API,
} from "@orderly.network/types";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import {
  availableBinaryCloseQuantity,
  resolveBinaryCollateral,
} from "../binary/binaryCollateral";
import {
  binaryHistoryCompleteness,
  binaryHistoryForAccount,
  binaryHistorySnapshot,
  normalizeBinaryHistory,
  toPredictionSettlement,
  type BinaryHistorySnapshot,
} from "../binary/binaryHistory";
import { binaryRoundFromSymbol, isBinarySymbol } from "../binary/binaryInfo";
import { toPredictionOrder } from "../binary/binaryOrderDisplay";
import {
  pendingBinarySettlements,
  binarySettlementRefreshInterval,
} from "../binary/binarySettlement";
import { getSettlementResource } from "../data/settlementRegistry";
import {
  type PredictionOutcome,
  type PredictionPosition,
  type PredictionTrade,
} from "../prediction.types";

const TERMINAL_ORDER_STATUSES = new Set([
  OrderStatus.FILLED,
  OrderStatus.CANCELLED,
  OrderStatus.REJECTED,
]);
const toDisplayPrice = (price: number) => new Decimal(1).sub(price).toNumber();
export const usePredictionAccountResources = ({
  enabled: active = true,
  includeHistory = true,
  nowMs,
}: {
  enabled?: boolean;
  includeHistory?: boolean;
  nowMs?: number;
} = {}) => {
  const { state: accountState } = useAccount();
  const accountReady =
    accountState.status >= AccountStatusEnum.EnableTrading ||
    accountState.status === AccountStatusEnum.EnableTradingWithoutConnected;
  const { freeCollateral } = useCollateral({ dp: 6 });
  // Available collateral in USDC, including account-level funding constraints.
  const balance = Number.isFinite(freeCollateral)
    ? Math.max(0, freeCollateral)
    : 0;
  // Binary orders only (api-spec §5.1.1). executionreport WS deltas keep both
  // streams fresh; the key prefix contract is unchanged.
  const [pendingOrdersData, pendingOrdersStream] = useOrderStream(
    { status: OrderStatus.INCOMPLETE, size: 100, productType: "BINARY" },
    { keeplive: true, enabled: active && accountReady },
  );
  const pendingTotal = pendingOrdersStream.meta?.total;
  const pendingOrdersComplete =
    pendingTotal !== undefined &&
    Number.isInteger(pendingTotal) &&
    pendingTotal >= 0 &&
    !pendingOrdersStream.error &&
    !pendingOrdersStream.isLoading &&
    !pendingOrdersStream.isValidating &&
    (pendingOrdersData?.length ?? 0) >= pendingTotal;
  useEffect(() => {
    if (
      active &&
      pendingTotal !== undefined &&
      (pendingOrdersData?.length ?? 0) < pendingTotal &&
      !pendingOrdersStream.error &&
      pendingOrdersStream.hasMore !== false &&
      !pendingOrdersStream.isValidating
    ) {
      pendingOrdersStream.loadMore();
    }
  }, [
    active,
    pendingTotal,
    pendingOrdersData?.length,
    pendingOrdersStream.error,
    pendingOrdersStream.hasMore,
    pendingOrdersStream.isValidating,
    pendingOrdersStream.loadMore,
  ]);
  const [allOrdersData, allOrdersStream] = useOrderStream(
    { size: 100, productType: "BINARY" },
    { keeplive: true, enabled: active && accountReady && includeHistory },
  );
  const openOrders = useMemo(
    () =>
      (pendingOrdersData ?? [])
        .filter((order) => !order.algo_order_id && isBinarySymbol(order.symbol))
        .map(toPredictionOrder),
    [pendingOrdersData],
  );
  const history = useMemo<PredictionTrade[]>(
    () =>
      (allOrdersData ?? [])
        .filter(
          (order) =>
            !order.algo_order_id &&
            isBinarySymbol(order.symbol) &&
            TERMINAL_ORDER_STATUSES.has(order.status),
        )
        .map((order) => ({
          ...toPredictionOrder(order),
          status:
            order.status === OrderStatus.FILLED
              ? ("filled" as const)
              : ("cancelled" as const),
        })),
    [allOrdersData],
  );
  const [positionData] = usePositionStream();
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
      (positionData?.rows ?? [])
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
              : toDisplayPrice(row.average_open_price),
          symbol: row.symbol,
          round: binaryRoundFromSymbol(row.symbol) ?? undefined,
        })),
    [positionData],
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
  const historyEnabled =
    active && includeHistory && accountReady && !!accountState.accountId;
  const { cache } = useSWRConfig();
  const watch = useMemo(
    () =>
      getSettlementResource(
        cache,
        active && accountReady ? accountState.accountId : undefined,
      ),
    [cache, active, accountReady, accountState.accountId],
  );
  const observedHoldings = useSyncExternalStore(
    watch.subscribe,
    watch.getSnapshot,
    watch.getSnapshot,
  );
  useEffect(() => {
    if (!active || !accountReady) return;
    watch.update({
      accountId: accountState.accountId,
      active: true,
      positions,
      seedPositions: accountPositions?.rows
        ?.filter((row) => isBinarySymbol(row.symbol))
        .map((row) => ({
          symbol: row.symbol,
          outcome: row.position_qty > 0 ? ("up" as const) : ("down" as const),
          quantity: Math.abs(row.position_qty),
        })),
      now: getTimestamp(),
    });
  }, [
    watch,
    active,
    accountReady,
    accountState.accountId,
    positions,
    nowMs,
    accountPositions,
  ]);
  const accountHoldings = observedHoldings.holdings;
  const {
    data: historyResponse,
    error: historyError,
    isLoading: historyLoading,
    mutate: refreshHistory,
  } = usePrivateQuery<BinaryHistorySnapshot>(
    historyEnabled
      ? "/v1/position_history?product_type=BINARY&limit=1000"
      : null,
    {
      formatter: (data) => binaryHistorySnapshot(accountState.accountId!, data),
      keepPreviousData: false,
      revalidateOnFocus: true,
      refreshInterval: 0,
    },
  );
  const historySnapshot = binaryHistoryForAccount(
    historyResponse,
    accountState.accountId,
    historyEnabled,
  );
  const historyRecords = useMemo(
    () => (historySnapshot?.rows ?? []).map(normalizeBinaryHistory),
    [historySnapshot],
  );
  const historyCompleteness = binaryHistoryCompleteness({
    loaded: historySnapshot?.rows != null,
    failed: Boolean(historyError),
    rowCount: historySnapshot?.rows?.length ?? 0,
    limit: 1000,
  });
  const settlements = useMemo(
    () => historyRecords.map(toPredictionSettlement),
    [historyRecords],
  );
  const pendingSettlementSymbols = pendingBinarySettlements(
    historyRecords,
    accountHoldings,
    nowMs ?? getTimestamp(),
  );
  const nextHistoryRefreshInterval = binarySettlementRefreshInterval(
    historyEnabled,
    pendingSettlementSymbols,
  );
  const refreshHistoryCurrent = useMemoizedFn(
    (expectedAccountId: string | undefined) => {
      if (
        !historyEnabled ||
        accountState.accountId !== expectedAccountId ||
        accountState.accountId !== observedHoldings.accountId
      )
        return Promise.resolve();
      return refreshHistory();
    },
  );
  useEffect(() => {
    if (!historyEnabled) return;
    const expectedAccountId = accountState.accountId;
    return watch.retainPolling(
      () => refreshHistoryCurrent(expectedAccountId),
      nextHistoryRefreshInterval,
    );
  }, [
    watch,
    historyEnabled,
    refreshHistoryCurrent,
    nextHistoryRefreshInterval,
  ]);
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
    settlements,
    historyRecords,
    historyCompleteness,
    historyLoading,
    historyError,
    pendingSettlementSymbols,
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

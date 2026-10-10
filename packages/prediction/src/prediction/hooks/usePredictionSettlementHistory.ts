import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  useMemoizedFn,
  usePrivateQuery,
  useSWRConfig,
} from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import { getTimestamp } from "@orderly.network/utils";
import {
  binaryHistoryCompleteness,
  binaryHistoryForAccount,
  binaryHistorySnapshot,
  normalizeBinaryHistory,
  toPredictionSettlement,
  type BinaryHistorySnapshot,
} from "../binary/binaryHistory";
import { isBinarySymbol } from "../binary/binaryInfo";
import {
  binarySettlementRefreshInterval,
  pendingBinarySettlements,
} from "../binary/binarySettlement";
import { getSettlementResource } from "../data/settlementRegistry";
import type {
  PredictionPosition,
  PredictionSettlementHistoryState,
} from "../prediction.types";

interface SettlementHistoryArgs {
  accountId?: string;
  enabled: boolean;
  includeSettlementHistory?: boolean;
  nowMs?: number;
  /** Omitted by read-only history consumers: only base account resources observe holdings. */
  positions?: PredictionPosition[];
  seedPositions?: API.Position[];
}
/** Shared observations retain vanished holdings until personal history confirms settlement. */
export function usePredictionSettlementHistory({
  accountId,
  enabled,
  includeSettlementHistory = false,
  nowMs,
  positions,
  seedPositions,
}: SettlementHistoryArgs): PredictionSettlementHistoryState {
  const { cache } = useSWRConfig();
  const watch = useMemo(
    () => getSettlementResource(cache, enabled ? accountId : undefined),
    [cache, enabled, accountId],
  );
  const observed = useSyncExternalStore(
    watch.subscribe,
    watch.getSnapshot,
    watch.getSnapshot,
  );
  useEffect(() => {
    if (!enabled || !positions) return;
    watch.update({
      accountId,
      active: true,
      positions,
      seedPositions: seedPositions
        ?.filter((row) => isBinarySymbol(row.symbol))
        .map((row) => ({
          symbol: row.symbol,
          outcome: row.position_qty > 0 ? "up" : "down",
          quantity: Math.abs(row.position_qty),
        })),
      now: getTimestamp(),
    });
  }, [watch, enabled, accountId, positions, seedPositions, nowMs]);
  const cachedRecords = useMemo(
    () => (observed.historySnapshot?.rows ?? []).map(normalizeBinaryHistory),
    [observed.historySnapshot],
  );
  const pendingObserved = pendingBinarySettlements(
    [...cachedRecords, ...observed.confirmedHistoryRecords],
    observed.holdings,
    nowMs ?? getTimestamp(),
  );
  const historyEnabled =
    enabled &&
    !!accountId &&
    (includeSettlementHistory || pendingObserved.length > 0);
  const {
    data: response,
    error: historyError,
    isLoading,
    mutate: refreshHistory,
  } = usePrivateQuery<BinaryHistorySnapshot>(
    historyEnabled
      ? "/v1/position_history?product_type=BINARY&limit=1000"
      : null,
    {
      formatter: (data) => binaryHistorySnapshot(accountId!, data),
      keepPreviousData: false,
      revalidateOnFocus: true,
      refreshInterval: 0,
    },
  );
  const current = binaryHistoryForAccount(response, accountId, historyEnabled);
  useEffect(() => {
    if (current?.rows) watch.rememberHistory(current);
  }, [watch, current]);
  const cachedSnapshot =
    enabled && observed.accountId === accountId
      ? observed.historySnapshot
      : undefined;
  const snapshot =
    current &&
    !(cachedSnapshot && current.receivedAt < cachedSnapshot.receivedAt)
      ? current
      : cachedSnapshot;
  const historyRecords = useMemo(
    () => (snapshot?.rows ?? []).map(normalizeBinaryHistory),
    [snapshot],
  );
  const pendingSettlementSymbols = pendingBinarySettlements(
    [...historyRecords, ...observed.confirmedHistoryRecords],
    observed.holdings,
    nowMs ?? getTimestamp(),
  );
  const pollingEnabled =
    historyEnabled &&
    (includeSettlementHistory || pendingSettlementSymbols.length > 0);
  const interval = binarySettlementRefreshInterval(
    pollingEnabled,
    pendingSettlementSymbols,
  );
  const refreshCurrent = useMemoizedFn((expectedAccountId?: string) => {
    if (
      !pollingEnabled ||
      accountId !== expectedAccountId ||
      observed.accountId !== expectedAccountId
    )
      return Promise.resolve();
    return refreshHistory();
  });
  useEffect(() => {
    if (!pollingEnabled) return;
    return watch.retainPolling(() => refreshCurrent(accountId), interval);
  }, [watch, pollingEnabled, refreshCurrent, accountId, interval]);
  return {
    historyRecords,
    settlements: useMemo(
      () => historyRecords.map(toPredictionSettlement),
      [historyRecords],
    ),
    historyCompleteness: binaryHistoryCompleteness({
      loaded: snapshot?.rows != null,
      failed: Boolean(historyError),
      rowCount: snapshot?.rows?.length ?? 0,
      limit: 1000,
    }),
    historyLoading: historyEnabled && !!isLoading,
    historyError: historyEnabled ? historyError : undefined,
    pendingSettlementSymbols,
  };
}

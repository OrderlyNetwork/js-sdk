import { useEffect, useMemo, useSyncExternalStore } from "react";
import {
  unstable_serialize,
  useMemoizedFn,
  usePrivateQuery,
  useSWRConfig,
} from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import { getTimestamp } from "@orderly.network/utils";
import {
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

/**
 * Pending scans only cross round-expiry boundaries, which the settlement poll
 * (5s fast tier) already bounds; quantize the clock so the 1s round tick does
 * not re-run the O(records) history dedupe every second.
 */
const PENDING_SETTLEMENT_TICK_MS = 5_000;
const SETTLEMENT_HISTORY_QUERY =
  "/v1/position_history?product_type=BINARY&limit=1000";

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
  const pendingNowMs =
    nowMs == null
      ? undefined
      : Math.floor(nowMs / PENDING_SETTLEMENT_TICK_MS) *
        PENDING_SETTLEMENT_TICK_MS;
  const pendingObserved = useMemo(
    () =>
      pendingBinarySettlements(
        [...cachedRecords, ...observed.confirmedHistoryRecords],
        observed.holdings,
        pendingNowMs ?? getTimestamp(),
      ),
    [
      cachedRecords,
      observed.confirmedHistoryRecords,
      observed.holdings,
      pendingNowMs,
    ],
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
    historyEnabled ? SETTLEMENT_HISTORY_QUERY : null,
    {
      formatter: (data) => binaryHistorySnapshot(accountId!, data),
      keepPreviousData: false,
      // revalidateOnFocus is redundant here: while this query is enabled the
      // settlement registry poller already refreshes it (5s while settlements
      // are pending, 60s heartbeat otherwise), so focus would only re-pull
      // the 1000-row payload. Perp positionHistory keeps focus refresh
      // because it has no poller; do not copy that setting here.
      revalidateOnFocus: false,
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
  const pendingSettlementSymbols = useMemo(
    () =>
      pendingBinarySettlements(
        [...historyRecords, ...observed.confirmedHistoryRecords],
        observed.holdings,
        pendingNowMs ?? getTimestamp(),
      ),
    [
      historyRecords,
      observed.confirmedHistoryRecords,
      observed.holdings,
      pendingNowMs,
    ],
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
    // Read the live cache, not a render-time flag: an initial load or reconnect
    // may already be fetching when this timer fires. mutate() would bypass SWR
    // request deduplication and start another request for the same key.
    const queryKey = unstable_serialize([
      SETTLEMENT_HISTORY_QUERY,
      expectedAccountId,
    ]);
    if (cache.get(queryKey)?.isValidating) return Promise.resolve();
    return refreshHistory();
  });
  useEffect(() => {
    if (!pollingEnabled) return;
    return watch.retainPolling(() => refreshCurrent(accountId), interval);
  }, [watch, pollingEnabled, refreshCurrent, accountId, interval]);
  const settlements = useMemo(
    () => historyRecords.map(toPredictionSettlement),
    [historyRecords],
  );
  // Stable identity: parent renders (orderbook ticks, round clock) otherwise
  // bust every consumer memo keyed on this state.
  return useMemo(
    () => ({
      historyRecords,
      settlements,
      historyLoading: historyEnabled && !!isLoading,
      historyError: historyEnabled ? historyError : undefined,
      pendingSettlementSymbols,
    }),
    [
      historyRecords,
      settlements,
      historyEnabled,
      isLoading,
      historyError,
      pendingSettlementSymbols,
    ],
  );
}

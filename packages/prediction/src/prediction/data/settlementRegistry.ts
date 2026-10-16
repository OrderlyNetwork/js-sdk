import {
  normalizeBinaryHistory,
  type BinaryHistorySnapshot,
  type BinaryHistoryRecord,
} from "../binary/binaryHistory";
import {
  updateBinarySettlementWatch,
  binaryHistorySegments,
  type BinarySettlementWatch,
} from "../binary/binarySettlement";

type Cache = {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
};

/** Account-scoped observations live in the same cache as private query snapshots. */
export function createSettlementResource(accountId?: string) {
  let state: BinarySettlementWatch & {
    historySnapshot?: BinaryHistorySnapshot;
    confirmedHistoryRecords: BinaryHistoryRecord[];
  } = {
    accountId,
    holdings: [],
    initialized: false,
    confirmedHistoryRecords: [],
  };
  let streamFingerprint: string | undefined;
  let needsRestValidation = true;
  const listeners = new Set<() => void>();
  const pollers = new Map<
    symbol,
    { refresh: () => Promise<unknown>; interval: number }
  >();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let refreshing = false;
  const pollingInterval = () =>
    Math.min(...[...pollers.values()].map((poller) => poller.interval));
  const stop = () => {
    generation++;
    clearTimeout(timer);
    timer = undefined;
  };
  const schedule = () => {
    stop();
    if (!pollers.size || refreshing) return;
    const epoch = generation;
    timer = setTimeout(() => void fire(epoch), pollingInterval());
  };
  const fire = async (epoch: number) => {
    if (epoch !== generation) return;
    timer = undefined;
    const poller = pollers.values().next().value;
    if (!poller || refreshing) return;
    refreshing = true;
    try {
      // Every consumer reads the same account/query cache, so only one refresh
      // is needed even when several subscribers request the same deadline.
      await poller.refresh();
    } catch {
      // The query exposes errors to consumers; a failed refresh must not stop
      // polling or leave an unhandled timer rejection.
    } finally {
      refreshing = false;
      // Subscribers may have changed while awaiting the request. Resume from
      // the current set rather than the timer generation that started it.
      schedule();
    }
  };
  return {
    getSnapshot: () => state,
    rememberHistory: (snapshot: BinaryHistorySnapshot) => {
      if (
        snapshot.accountId !== accountId ||
        snapshot === state.historySnapshot
      )
        return;
      if (
        state.historySnapshot &&
        snapshot.receivedAt < state.historySnapshot.receivedAt
      )
        return;
      const segments = binaryHistorySegments([
        ...state.confirmedHistoryRecords,
        ...(snapshot.rows ?? []).map(normalizeBinaryHistory),
      ]);
      state = {
        ...state,
        historySnapshot: snapshot,
        confirmedHistoryRecords: segments.records.filter(
          (record) =>
            record.issues.length === 0 &&
            !segments.conflictedRecordKeys.includes(record.recordKey) &&
            (record.state === "settled" || record.state === "exit"),
        ),
      };
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      // Cached observations survive account changes, stream ownership does not.
      if (!listeners.size) needsRestValidation = true;
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    update: (input: Parameters<typeof updateBinarySettlementWatch>[1]) => {
      if (input.accountId !== accountId) return;
      const fingerprint = JSON.stringify(input.positions);
      if (needsRestValidation && (!input.active || input.seedPositions == null))
        return;
      if (
        !needsRestValidation &&
        state.initialized &&
        input.active &&
        fingerprint === streamFingerprint
      )
        return;
      if (input.active && (state.initialized || input.seedPositions != null))
        streamFingerprint = fingerprint;
      const next = updateBinarySettlementWatch(
        state,
        needsRestValidation
          ? { ...input, positions: input.seedPositions! }
          : input,
      );
      needsRestValidation = false;
      if (next === state) return;
      state = {
        ...next,
        confirmedHistoryRecords: state.confirmedHistoryRecords,
        ...(state.historySnapshot
          ? { historySnapshot: state.historySnapshot }
          : {}),
      };
      listeners.forEach((listener) => listener());
    },
    retainPolling: (refresh: () => Promise<unknown>, interval: number) => {
      const token = Symbol();
      const previousInterval = pollingInterval();
      pollers.set(token, { refresh, interval });
      // Initial loading belongs to the query. New consumers only adjust the
      // cadence, and equal-cadence subscriptions must not postpone a deadline.
      if (pollingInterval() !== previousInterval) schedule();
      return () => {
        const previousInterval = pollingInterval();
        pollers.delete(token);
        if (pollingInterval() !== previousInterval) schedule();
      };
    },
  };
}
const EMPTY = createSettlementResource();
export function getSettlementResource(cache: Cache, accountId?: string) {
  if (!accountId) return EMPTY;
  const key = JSON.stringify(["prediction/settlement-watch", accountId]);
  const stored = cache.get(key) as
    | { data?: ReturnType<typeof createSettlementResource> }
    | undefined;
  if (stored?.data) return stored.data;
  const resource = createSettlementResource(accountId);
  cache.set(key, { data: resource });
  return resource;
}

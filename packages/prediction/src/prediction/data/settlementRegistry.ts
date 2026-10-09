import {
  updateBinarySettlementWatch,
  type BinarySettlementWatch,
} from "../binary/binarySettlement";

type Cache = {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
};

/** Account-scoped observations live in the same cache as private query snapshots. */
export function createSettlementResource(accountId?: string) {
  let state: BinarySettlementWatch = {
    accountId,
    holdings: [],
    initialized: false,
  };
  let streamFingerprint: string | undefined;
  let needsRestValidation = true;
  const listeners = new Set<() => void>();
  const pollers = new Map<
    symbol,
    { refresh: () => Promise<unknown>; interval: number; nextDue: number }
  >();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  const stop = () => {
    generation++;
    clearTimeout(timer);
    timer = undefined;
  };
  const schedule = () => {
    stop();
    if (!pollers.size) return;
    const epoch = generation;
    const delay = Math.max(
      0,
      Math.min(...[...pollers.values()].map((p) => p.nextDue)) - Date.now(),
    );
    timer = setTimeout(() => void fire(epoch), delay);
  };
  const fire = async (epoch: number) => {
    if (epoch !== generation) return;
    const stamp = Date.now();
    const due = [...pollers.values()].filter((p) => p.nextDue <= stamp);
    // Claim each deadline before awaiting: a retain/release landing during an
    // in-flight refresh must not re-arm the same poller in a new chain.
    for (const poller of due) poller.nextDue = stamp + poller.interval;
    await Promise.allSettled(
      due.map((poller) =>
        epoch === generation ? poller.refresh() : undefined,
      ),
    );
    if (epoch === generation) schedule();
  };
  return {
    getSnapshot: () => state,
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
      state = next;
      listeners.forEach((listener) => listener());
    },
    retainPolling: (refresh: () => Promise<unknown>, interval: number) => {
      const token = Symbol();
      const previousInterval = pollers.size
        ? Math.min(...[...pollers.values()].map((p) => p.interval))
        : Infinity;
      pollers.set(token, {
        refresh,
        interval,
        nextDue: Date.now() + interval,
      });
      schedule();
      // Re-entry immediately validates retained observations with the bound query.
      if (pollers.size === 1 || interval < previousInterval)
        void Promise.resolve()
          .then(() => (pollers.has(token) ? refresh() : undefined))
          .catch(() => undefined);
      return () => {
        pollers.delete(token);
        schedule();
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

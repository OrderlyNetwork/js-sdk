import { subscribeTimestampOffset } from "@orderly.network/net";
import type { BinaryInfoRow } from "./binaryInfo";

/** Offset changes and page wakeups both invalidate locally scheduled boundaries. */
export function subscribeBinaryTime(listener: () => void): () => void {
  const unsubscribeOffset = subscribeTimestampOffset(listener);
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof window.addEventListener !== "function" ||
    typeof document.addEventListener !== "function"
  ) {
    return unsubscribeOffset;
  }
  const onWake = () => {
    if (document.visibilityState === "visible") listener();
  };
  // Restoring the device clock can restore the old offset as well. Wake the
  // observer even when its next valid response leaves that offset unchanged.
  window.addEventListener("focus", onWake);
  document.addEventListener("visibilitychange", onWake);
  return () => {
    unsubscribeOffset();
    window.removeEventListener("focus", onWake);
    document.removeEventListener("visibilitychange", onWake);
  };
}

/**
 * Grace period after T1 before the waiting-result detail poll may start. The
 * outcome is not available the instant the round expires — a request fired
 * right at expiry would come back without `result_committed_at` — so the
 * first poll is deferred this long past `expire_at`.
 */
export const BINARY_RESULT_POLL_DELAY_MS = 5_000;

type RoundClock = {
  now: () => number;
  setTimeout: (callback: () => void, delay: number) => number;
  clearTimeout: (timer: number) => void;
  subscribe?: (listener: () => void) => () => void;
};

/** Keep round time current at lifecycle boundaries until the observer stops. */
export const startBinaryRoundClock = (
  rows: BinaryInfoRow[],
  onTick: (now: number) => void,
  clock: RoundClock,
) => {
  let timer: number | undefined;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    if (timer !== undefined) {
      clock.clearTimeout(timer);
      timer = undefined;
    }
    const now = clock.now();
    onTick(now);
    const next = Math.min(
      ...rows
        .flatMap((row) => [
          row.observation_start_at,
          row.expire_at - 30_000,
          row.expire_at,
          row.expire_at + BINARY_RESULT_POLL_DELAY_MS,
        ])
        .filter((boundary) => boundary > now),
    );
    if (Number.isFinite(next)) {
      // Evaluate just after the boundary, then schedule the following one.
      timer = clock.setTimeout(tick, next + 5 - now);
    }
  };

  // New snapshots and reactivation must catch up even with no future boundary.
  tick();
  // Keep listening even with no future boundary: calibration can revive a round.
  const unsubscribe = clock.subscribe?.(tick);

  return () => {
    stopped = true;
    unsubscribe?.();
    if (timer !== undefined) clock.clearTimeout(timer);
  };
};

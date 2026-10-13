const RECALIBRATION_THRESHOLD_MS = 1_000;
const MAX_TRANSIT_MS = 5_000;
const OFFSET_KEY = "__ORDERLY_timestamp_offset";
const LISTENERS_KEY = "__ORDERLY_timestamp_offset_listeners";

const getListeners = (): Set<() => void> => {
  const globalObj = globalThis as Record<string, unknown>;
  return (globalObj[LISTENERS_KEY] ??= new Set<() => void>()) as Set<
    () => void
  >;
};

/** Subscribe to actual offset updates, including the first successful calibration. */
export function subscribeTimestampOffset(listener: () => void): () => void {
  const listeners = getListeners();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Re-calibrate the global offset from valid success envelopes. Preserve an
 * existing offset within the request's uncertainty interval plus 1s, so
 * transport latency alone cannot trigger a clock correction.
 */
export function calibrateTimestampOffset(
  res: unknown,
  transitMs: number,
): void {
  const envelope = res as { success?: unknown; timestamp?: unknown } | null;
  if (
    !Number.isFinite(transitMs) ||
    transitMs < 0 ||
    transitMs > MAX_TRANSIT_MS ||
    !envelope ||
    envelope.success !== true ||
    typeof envelope.timestamp !== "number" ||
    !Number.isFinite(envelope.timestamp)
  ) {
    return;
  }
  const globalObj = globalThis as Record<string, unknown>;
  const newOffset = envelope.timestamp - Date.now();
  const currentOffset = globalObj[OFFSET_KEY];
  if (
    typeof currentOffset !== "number" ||
    !Number.isFinite(currentOffset) ||
    newOffset - currentOffset > RECALIBRATION_THRESHOLD_MS ||
    currentOffset - (newOffset + transitMs) > RECALIBRATION_THRESHOLD_MS
  ) {
    globalObj[OFFSET_KEY] = newOffset;
    getListeners().forEach((listener) => {
      try {
        listener();
      } catch (error) {
        // A consumer must not turn a successful REST response into a failure.
        console.error("Timestamp offset subscriber failed", error);
      }
    });
  }
}

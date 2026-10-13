const RECALIBRATION_THRESHOLD_MS = 1_000;
const MAX_TRANSIT_MS = 5_000;
const OFFSET_KEY = "__ORDERLY_timestamp_offset";

/**
 * Initialize or re-calibrate the server-time offset from a success envelope.
 * Request duration bounds the uncertainty in its generation timestamp.
 * Preserve an existing offset within that interval (plus the drift threshold)
 * so network latency alone cannot trigger re-calibration.
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
  // The true offset lies between newOffset and newOffset + transitMs.
  if (
    typeof currentOffset !== "number" ||
    !Number.isFinite(currentOffset) ||
    newOffset - currentOffset > RECALIBRATION_THRESHOLD_MS ||
    currentOffset - (newOffset + transitMs) > RECALIBRATION_THRESHOLD_MS
  ) {
    globalObj[OFFSET_KEY] = newOffset;
  }
}

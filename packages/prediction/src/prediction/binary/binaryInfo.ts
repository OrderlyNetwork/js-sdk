import type { API } from "@orderly.network/types";
import { BINARY_SYMBOL_PATTERN } from "@orderly.network/utils";
import type { PredictionRoundPhase } from "../prediction.types";

export { BINARY_SYMBOL_PATTERN, isBinarySymbol } from "@orderly.network/utils";

/**
 * Row of the unified Binary info snapshot
 * (`GET /v1/public/binary/info`, api-spec §3.1/§4.2). The list keeps the most
 * recent 300 rounds ordered by metadata id DESC and refreshes every minute on
 * the server side. Canonical shape lives in `@orderly.network/types`
 * (`API.BinaryInfoRow`) so the hooks-package observer and the prediction
 * pages share one definition.
 */
export type BinaryInfoRow = API.BinaryInfoRow;

/**
 * Round-specific binary symbol, e.g. `PERP_BTC5M2608271200_USDC`.
 * Legal periods per the spec are 5M/10M/15M; the timestamp segment is
 * yymmddHHMM in UTC. Used only as a fallback classifier for records whose
 * round already fell out of the 300-row snapshot (e.g. old position history).
 * The pattern itself lives in `@orderly.network/utils` (canonical copy).
 */

/** Round id (epoch seconds of T0) for a row still present in the snapshot. */
export const binaryRowRoundStart = (row: BinaryInfoRow) =>
  Math.floor(row.observation_start_at / 1000);

/**
 * Best-effort round start (epoch seconds) for a binary symbol that may no
 * longer be in the snapshot: parse yymmddHHMM from the symbol name, falling
 * back to aligning the provided timestamp down to the 5-minute grid.
 */
export const binaryRoundFromSymbol = (
  symbol: string,
  fallbackTimestampMs?: number,
): number | undefined => {
  const match = BINARY_SYMBOL_PATTERN.exec(symbol);
  if (match) {
    const [, , , datePart] = match;
    const yy = Number(datePart.slice(0, 2));
    const mm = Number(datePart.slice(2, 4));
    const dd = Number(datePart.slice(4, 6));
    const hh = Number(datePart.slice(6, 8));
    const mi = Number(datePart.slice(8, 10));
    const parsed = Date.UTC(2000 + yy, mm - 1, dd, hh, mi) / 1000;
    if (Number.isFinite(parsed)) return parsed;
  }
  if (typeof fallbackTimestampMs === "number") {
    return Math.floor(fallbackTimestampMs / 1000 / 300) * 300;
  }
  return undefined;
};

/**
 * Derive the UI round phase from server-calibrated time. The backend returns
 * no lifecycle field; per api-spec §4.3 phases come from
 * observation_start_at/expire_at/status/result_committed_at only. Rounds
 * before T0 are still "trading" (early trading is allowed until T1).
 */
export const deriveBinaryPhase = (
  row: BinaryInfoRow,
  nowMs: number,
): PredictionRoundPhase => {
  if (row.result_committed_at != null) {
    return row.outcome === "DOWN" ? "resolvedDown" : "resolvedUp";
  }
  if (nowMs >= row.expire_at) return "closed";
  const remainingSeconds = (row.expire_at - nowMs) / 1000;
  if (remainingSeconds <= 30) return "closingSoon";
  return "trading";
};

/** Only ACTIVE rounds before T1 accept orders (api-spec §4.3/§5.3). */
export const isBinaryRowTradable = (row: BinaryInfoRow, nowMs: number) =>
  row.status === "ACTIVE" && nowMs < row.expire_at;

/**
 * The "current" round shown by default: the newest round whose window is open
 * (T0 <= now < T1); when provisioning leaves a gap, the nearest future round.
 * Snapshot rows arrive ordered by metadata id DESC (newest first), so future
 * rounds precede the live one and the scan below cannot take a far-future
 * round for an in-window one.
 */
export const findCurrentBinaryRound = (
  rows: BinaryInfoRow[],
  nowMs: number,
) => {
  let nearestFuture: BinaryInfoRow | undefined;
  for (const row of rows) {
    if (row.observation_start_at <= nowMs && nowMs < row.expire_at) return row;
    if (row.observation_start_at > nowMs) nearestFuture = row;
  }
  return nearestFuture ?? rows[0];
};

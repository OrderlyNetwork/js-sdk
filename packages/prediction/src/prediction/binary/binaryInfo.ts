import type { API } from "@orderly.network/types";
import { parseBinarySymbol } from "@orderly.network/utils";
import type { PredictionRoundPhase } from "../prediction.types";
import { binaryResultPhase, publishedBinaryOutcome } from "./binaryResult";

export { BINARY_SYMBOL_PATTERN, isBinarySymbol } from "@orderly.network/utils";

/**
 * Round ids are the epoch seconds of the round start; consecutive rounds are
 * spaced by this many seconds and each round ends one interval after its id.
 * Also the minimum grid every legal period (5M/10M/15M) is a multiple of.
 */
export const ROUND_INTERVAL_SECONDS = 300;

/**
 * Row of the unified Binary info snapshot
 * (`GET /v1/public/binary/info`, api-spec §3.1/§4.2). The list keeps the most
 * recent 300 rounds ordered by metadata id DESC and refreshes every minute on
 * the server side. Canonical shape lives in `@orderly.network/types`
 * (`API.BinaryInfoRow`) so the hooks-package observer and the prediction
 * pages share one definition.
 */
export type BinaryInfoRow = API.BinaryInfoRow;

export type BinaryPriceEvidence = {
  s0: { price: number; timestamp: number; source: "live" };
  s1: { price: number; timestamp: number; source: "live" };
};

/** Evidence is only returned by the single-symbol detail endpoint. */
export type BinaryInfoDetail = BinaryInfoRow & {
  price_evidence?: BinaryPriceEvidence | null;
  manual_correction?: null;
};

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
 * Parsing is strict (see parseBinarySymbol): fabricated dates such as Feb 30
 * take the grid fallback rather than a silently rolled-over datetime.
 */
export const binaryRoundFromSymbol = (
  symbol: string,
  fallbackTimestampMs?: number,
): number | undefined => {
  const parsed = parseBinarySymbol(symbol);
  if (parsed) return parsed.roundStartMs / 1000;
  if (typeof fallbackTimestampMs === "number") {
    return (
      Math.floor(fallbackTimestampMs / 1000 / ROUND_INTERVAL_SECONDS) *
      ROUND_INTERVAL_SECONDS
    );
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
  const result = publishedBinaryOutcome(row);
  if (result) return binaryResultPhase(result);
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

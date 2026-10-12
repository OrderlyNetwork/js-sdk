import { Decimal } from "@orderly.network/utils";
import type { PredictionChartPoint } from "../prediction.types";
import { binaryRowRoundStart, type BinaryInfoRow } from "./binaryInfo";
import { getBinaryMarketIdentity } from "./binaryMarkets";

export const getRoundStatus = (row: BinaryInfoRow, now: number) =>
  now >= row.expire_at
    ? "ended"
    : now < row.observation_start_at
      ? "upcoming"
      : "live";

export const secondsUntil = (target: number, now: number) =>
  Math.max(0, Math.ceil((target - now) / 1_000));

/** Real, ready rounds only; historical records remain viewable after expiry. */
export const getViewableRounds = (rows: BinaryInfoRow[], now: number) =>
  rows
    .filter(
      (row) =>
        getBinaryMarketIdentity(row) != null &&
        (row.expire_at <= now
          ? row.expire_at >= now - 86_400_000
          : row.status === "ACTIVE"),
    )
    .sort((a, b) => a.expire_at - b.expire_at);

export const getRoundNavigation = (
  rows: BinaryInfoRow[],
  round: number,
  selectedRound: number,
  intervalSeconds: number,
  now: number,
) => {
  const available = getViewableRounds(rows, now);
  const byStart = new Map(
    available.map((row) => [binaryRowRoundStart(row), row]),
  );
  const starts =
    selectedRound === round
      ? [round - intervalSeconds, round, round + intervalSeconds]
      : [
          selectedRound,
          selectedRound + intervalSeconds,
          selectedRound + 2 * intervalSeconds,
        ];
  // At the end of the schedule, fill the main slots with the latest real rounds.
  const lastAvailable = available.at(-1);
  const visible =
    lastAvailable &&
    starts[2] > binaryRowRoundStart(lastAvailable) &&
    byStart.has(selectedRound)
      ? available.slice(-3)
      : starts.map((start) => byStart.get(start));
  return {
    visible,
    past: available.filter((row) => getRoundStatus(row, now) === "ended"),
    future: available.filter((row) => getRoundStatus(row, now) === "upcoming"),
  };
};

/** Missing official prices never turn into a candle close or live-price fallback. */
export const getRoundPrices = (
  row: BinaryInfoRow,
  currentPrice: number | undefined,
  now: number,
) => ({
  opening: row.s0 != null && Number.isFinite(row.s0) ? row.s0 : undefined,
  current:
    getRoundStatus(row, now) === "ended"
      ? row.s1 != null && Number.isFinite(row.s1)
        ? row.s1
        : undefined
      : currentPrice != null && Number.isFinite(currentPrice)
        ? currentPrice
        : undefined,
});

export const getPriceDifference = (current?: number, opening?: number) => {
  if (
    current == null ||
    opening == null ||
    !Number.isFinite(current) ||
    !Number.isFinite(opening)
  )
    return undefined;
  const amount = new Decimal(current).sub(opening);
  return {
    amount: amount.toNumber(),
    percent: opening > 0 ? amount.div(opening).mul(100).toNumber() : undefined,
    isUp: amount.gte(0),
  };
};

/** Keep real timestamps, deduplicate overlapping REST windows and bound history at T1. */
export const mergeIndexPoints = (
  history: PredictionChartPoint[],
  trailing: PredictionChartPoint[],
  expireAtMs?: number,
) => {
  const byTimestamp = new Map<number, PredictionChartPoint>();
  [...history, ...trailing].forEach((point) => {
    if (
      Number.isFinite(point.price) &&
      Number.isFinite(point.timestamp) &&
      (expireAtMs == null || point.timestamp < expireAtMs)
    ) {
      byTimestamp.set(point.timestamp, point);
    }
  });
  return [...byTimestamp.values()].sort((a, b) => a.timestamp - b.timestamp);
};

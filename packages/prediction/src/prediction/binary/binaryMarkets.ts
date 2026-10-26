import { parseBinarySymbol } from "@orderly.network/utils";
import type { PredictionMarket } from "../prediction.types";
import type { BinaryInfoRow } from "./binaryInfo";

export type BinaryMarket = PredictionMarket;

/** Underlying index symbol such as `PERP_BTC_USDC`; shared with productScope. */
export const INDEX_SYMBOL_PATTERN = /^PERP_([A-Z0-9]+)_([A-Z0-9]+)$/;

const PERIODS = new Set([5, 10, 15]);

export function parseBinaryRoundSymbol(symbol?: string) {
  const parsed = symbol ? parseBinarySymbol(symbol) : undefined;
  if (!parsed) return null;
  return {
    base: parsed.base,
    period: parsed.period,
    quote: parsed.quote,
    roundStart: parsed.roundStartMs,
    intervalSeconds: parsed.intervalSeconds,
  };
}

/** A market is a product family; the dated binary symbol identifies one round. */
export function getBinaryMarketIdentity(row: BinaryInfoRow) {
  if (row.product_type !== "BINARY" || row.fee_model !== "BINARY_PROBABILITY") {
    return null;
  }
  const match = INDEX_SYMBOL_PATTERN.exec(row.index_price_symbol);
  const minutes = (row.expire_at - row.observation_start_at) / 60_000;
  if (!match || !PERIODS.has(minutes)) return null;
  const [, base, quote] = match;
  const period = `${minutes}M`;
  const symbol = parseBinaryRoundSymbol(row.symbol);
  if (
    !symbol ||
    symbol.base !== base ||
    symbol.quote !== quote ||
    symbol.period !== period ||
    symbol.roundStart !== row.observation_start_at
  )
    return null;
  return {
    id: `PERP_${base}${period}_${quote}`,
    base,
    quote,
    period,
    intervalSeconds: minutes * 60,
    indexPriceSymbol: row.index_price_symbol,
  };
}

/**
 * currentRow preference tier: a started unexpired round (live) beats the
 * nearest future round, which beats expired history. Expired rows also
 * satisfy `observation_start_at <= now`, so tiers must be derived explicitly
 * instead of reusing that single comparison.
 */
const binaryRowTier = (row: BinaryInfoRow, now: number): 0 | 1 | 2 =>
  row.status !== "ACTIVE" || row.expire_at <= now
    ? 0
    : row.observation_start_at <= now
      ? 2
      : 1;

const isBetterCurrentRow = (
  candidate: BinaryInfoRow,
  current: BinaryInfoRow,
  now: number,
) => {
  const candidateTier = binaryRowTier(candidate, now);
  const currentTier = binaryRowTier(current, now);
  if (candidateTier !== currentTier) return candidateTier > currentTier;
  switch (candidateTier) {
    case 2:
      return candidate.observation_start_at > current.observation_start_at;
    case 1:
      return candidate.observation_start_at < current.observation_start_at;
    default:
      return candidate.expire_at > current.expire_at;
  }
};

/** Select a real same-market fallback without treating inactive future rows as history. */
export function selectBinaryRoundFallback(
  rows: BinaryInfoRow[],
  marketId: string | undefined,
  now: number,
): BinaryInfoRow | undefined {
  if (!marketId) return undefined;
  let selected: BinaryInfoRow | undefined;
  for (const row of rows) {
    if (
      getBinaryMarketIdentity(row)?.id !== marketId ||
      (row.status !== "ACTIVE" && row.expire_at > now)
    )
      continue;
    if (!selected || isBetterCurrentRow(row, selected, now)) selected = row;
  }
  return selected;
}

/**
 * Markets stay visible while the snapshot still carries any of their rounds —
 * including fully expired or delisted history, which remains browsable via
 * `currentRow` until the backend drops it from the recent-rows cache. Only
 * markets with a live (`hasLiveRow`) round are tradable.
 */
export function deriveBinaryMarkets(
  rows: BinaryInfoRow[],
  now: number,
): BinaryMarket[] {
  const groups = new Map<string, BinaryMarket>();
  for (const row of rows) {
    const identity = getBinaryMarketIdentity(row);
    if (!identity) continue;
    const tier = binaryRowTier(row, now);
    const previous = groups.get(identity.id);
    if (!previous) {
      groups.set(identity.id, {
        ...identity,
        currentRow: row,
        hasLiveRow: tier > 0,
      });
      continue;
    }
    if (tier > 0) previous.hasLiveRow = true;
    if (isBetterCurrentRow(row, previous.currentRow, now)) {
      previous.currentRow = row;
    }
  }
  return [...groups.values()].sort(
    (a, b) =>
      Number(b.hasLiveRow) - Number(a.hasLiveRow) ||
      a.base.localeCompare(b.base) ||
      a.intervalSeconds - b.intervalSeconds ||
      a.quote.localeCompare(b.quote),
  );
}

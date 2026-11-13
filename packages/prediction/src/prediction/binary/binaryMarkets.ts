import { parseBinarySymbol } from "@orderly.network/utils";
import type { PredictionMarket } from "../prediction.types";
import type { BinaryInfoRow } from "./binaryInfo";

export type BinaryMarket = PredictionMarket;

/**
 * Binary info `index_price_symbol` formats: the current underlying perp index
 * (`PERP_BTC_USDC`) and the Predict TWAP index the backend may switch to
 * (`SPOT_BTCTWAP60S_USDC`). The TWAP branch is explicit so its suffix never
 * leaks into the base; other SPOT symbols are rejected.
 */
const INDEX_SYMBOL_PATTERN =
  /^(?:PERP_([A-Z0-9]+)|SPOT_([A-Z0-9]+?)TWAP\d+S)_([A-Z0-9]+)$/;

/**
 * Parse an underlying index symbol in either supported format into its
 * base/quote and the underlying perp market symbol (`PERP_{base}_{quote}`),
 * so callers stay independent of which format the backend returns.
 */
export function parseIndexPriceSymbol(symbol?: string | null) {
  const match = symbol ? INDEX_SYMBOL_PATTERN.exec(symbol) : null;
  if (!match) return null;
  const base = match[1] ?? match[2];
  const quote = match[3];
  return { base, quote, perpSymbol: `PERP_${base}_${quote}` };
}

/**
 * Index symbol the round chart reads prices from (REST history and the
 * `{symbol}@indexprice` WS topic): the Predict Index S0/S1 are captured from
 * (`settlement_index_symbol`, e.g. `SPOT_BTCTWAP60S_USDC`), falling back to
 * the underlying index while the field is missing during rollout.
 */
export const resolveIndexPriceSourceSymbol = (
  row:
    | Pick<BinaryInfoRow, "index_price_symbol" | "settlement_index_symbol">
    | undefined,
  fallbackIndexSymbol?: string,
) =>
  row?.settlement_index_symbol ||
  row?.index_price_symbol ||
  fallbackIndexSymbol ||
  "";

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
  const index = parseIndexPriceSymbol(row.index_price_symbol);
  const minutes = (row.expire_at - row.observation_start_at) / 60_000;
  if (!index || !PERIODS.has(minutes)) return null;
  const { base, quote } = index;
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

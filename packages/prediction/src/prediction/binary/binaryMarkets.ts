import type { BinaryInfoRow } from "./binaryInfo";

export type BinaryMarket = {
  id: string;
  base: string;
  quote: string;
  period: string;
  intervalSeconds: number;
  indexPriceSymbol: string;
  currentRow: BinaryInfoRow;
};

const INDEX_SYMBOL_PATTERN = /^PERP_([A-Z0-9]+)_([A-Z0-9]+)$/;
const ROUND_SYMBOL_PATTERN =
  /^PERP_([A-Z0-9]+?)(5M|10M|15M)(\d{10})_([A-Z0-9]+)$/;
const PERIODS = new Set([5, 10, 15]);

export function parseBinaryRoundSymbol(symbol?: string) {
  const match = symbol ? ROUND_SYMBOL_PATTERN.exec(symbol) : null;
  if (!match) return null;
  const datePart = match[3];
  const roundStart = Date.UTC(
    2000 + Number(datePart.slice(0, 2)),
    Number(datePart.slice(2, 4)) - 1,
    Number(datePart.slice(4, 6)),
    Number(datePart.slice(6, 8)),
    Number(datePart.slice(8, 10)),
  );
  const normalized = new Date(roundStart)
    .toISOString()
    .replace(/[-:T]/g, "")
    .slice(2, 12);
  if (normalized !== datePart) return null;
  return {
    base: match[1],
    period: match[2],
    quote: match[4],
    roundStart,
    intervalSeconds: Number(match[2].slice(0, -1)) * 60,
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

export function deriveBinaryMarkets(
  rows: BinaryInfoRow[],
  now: number,
): BinaryMarket[] {
  const groups = new Map<string, BinaryMarket>();
  for (const row of rows) {
    if (row.status !== "ACTIVE" || row.expire_at <= now) continue;
    const identity = getBinaryMarketIdentity(row);
    if (!identity) continue;
    const previous = groups.get(identity.id);
    const isCurrent = row.observation_start_at <= now;
    const previousIsCurrent =
      previous && previous.currentRow.observation_start_at <= now;
    if (
      !previous ||
      (isCurrent && !previousIsCurrent) ||
      (isCurrent === previousIsCurrent &&
        (isCurrent
          ? row.observation_start_at > previous.currentRow.observation_start_at
          : row.observation_start_at <
            previous.currentRow.observation_start_at))
    ) {
      groups.set(identity.id, { ...identity, currentRow: row });
    }
  }
  return [...groups.values()].sort(
    (a, b) =>
      a.base.localeCompare(b.base) ||
      a.intervalSeconds - b.intervalSeconds ||
      a.quote.localeCompare(b.quote),
  );
}

import assert from "node:assert/strict";
import test from "node:test";
import { binaryRoundFromSymbol } from "./binaryInfo";
import type { BinaryInfoRow } from "./binaryInfo";
import {
  deriveBinaryMarkets,
  getBinaryMarketIdentity,
  parseBinaryRoundSymbol,
} from "./binaryMarkets";

const now = Date.UTC(2026, 8, 29, 10, 36);

const row = (
  base: string,
  minutes: 5 | 10 | 15,
  start: number,
  status: BinaryInfoRow["status"] = "ACTIVE",
): BinaryInfoRow => {
  const date = new Date(start);
  const stamp = [
    String(date.getUTCFullYear()).slice(-2),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
  ].join("");
  return {
    symbol: `PERP_${base}${minutes}M${stamp}_USDC`,
    product_type: "BINARY",
    status,
    activated_at: start - 60_000,
    observation_start_at: start,
    expire_at: start + minutes * 60_000,
    index_price_symbol: `PERP_${base}_USDC`,
    fee_model: "BINARY_PROBABILITY",
    s0: null,
  };
};

test("groups dated rounds into one stable market and selects the live round", () => {
  const live = row("BTC", 5, Date.UTC(2026, 8, 29, 10, 35));
  const future = row("BTC", 5, Date.UTC(2026, 8, 29, 10, 40));
  const markets = deriveBinaryMarkets([future, live], now);
  assert.equal(markets.length, 1);
  assert.equal(markets[0].id, "PERP_BTC5M_USDC");
  assert.equal(markets[0].currentRow.symbol, live.symbol);
  assert.equal(markets[0].hasLiveRow, true);
  const upcoming = deriveBinaryMarkets(
    [row("BTC", 5, now + 10 * 60_000), future],
    now,
  );
  assert.equal(upcoming[0].currentRow.symbol, future.symbol);
  assert.equal(upcoming[0].hasLiveRow, true);
});

test("separates bases, periods and coincident round starts", () => {
  const start = Date.UTC(2026, 8, 29, 10, 35);
  const markets = deriveBinaryMarkets(
    [
      row("ETH", 5, start),
      row("BTC", 15, start),
      row("BTC", 10, start),
      row("BTC", 5, start),
    ],
    now,
  );
  assert.deepEqual(
    markets.map((market) => market.id),
    [
      "PERP_BTC5M_USDC",
      "PERP_BTC10M_USDC",
      "PERP_BTC15M_USDC",
      "PERP_ETH5M_USDC",
    ],
  );
  assert.equal(
    binaryRoundFromSymbol(row("BTC", 10, start).symbol),
    start / 1_000,
  );
});

test("symbol parsing delegates to the strict canonical parser", () => {
  const parsed = parseBinaryRoundSymbol("PERP_BTC5M2608271200_USDC");
  assert.deepEqual(parsed, {
    base: "BTC",
    period: "5M",
    quote: "USDC",
    roundStart: Date.UTC(2026, 7, 27, 12, 0),
    intervalSeconds: 300,
  });
  // Fabricated dates (Feb 30, month 13) reject instead of rolling over.
  assert.equal(parseBinaryRoundSymbol("PERP_BTC5M2602301200_USDC"), null);
  assert.equal(parseBinaryRoundSymbol("PERP_BTC5M2613301200_USDC"), null);
  // The canonical pattern pins the quote currency.
  assert.equal(parseBinaryRoundSymbol("PERP_BTC5M2608271200_USDT"), null);
  assert.equal(parseBinaryRoundSymbol(undefined), null);
});

test("binaryRoundFromSymbol falls back to the grid for malformed symbols", () => {
  assert.equal(binaryRoundFromSymbol("PERP_BTC5M2602301200_USDC"), undefined);
  const fallback = Date.UTC(2026, 8, 29, 10, 3, 7);
  assert.equal(
    binaryRoundFromSymbol("PERP_BTC5M2602301200_USDC", fallback),
    Math.floor(fallback / 1000 / 300) * 300,
  );
});

test("prefers live over future over expired rounds for currentRow", () => {
  const expired = row("BTC", 5, Date.UTC(2026, 8, 29, 10, 25));
  const future = row("BTC", 5, Date.UTC(2026, 8, 29, 10, 40));
  const live = row("BTC", 5, Date.UTC(2026, 8, 29, 10, 35));
  assert.equal(
    deriveBinaryMarkets([future, expired, live], now)[0].currentRow.symbol,
    live.symbol,
  );
  assert.equal(
    deriveBinaryMarkets([future, expired], now)[0].currentRow.symbol,
    future.symbol,
  );
  assert.equal(
    deriveBinaryMarkets([expired], now)[0].currentRow.symbol,
    expired.symbol,
  );
  assert.equal(deriveBinaryMarkets([future, expired], now)[0].hasLiveRow, true);
  assert.equal(deriveBinaryMarkets([expired], now)[0].hasLiveRow, false);
});

test("keeps expired-only and delisted-only markets browsable", () => {
  const older = row("BTC", 5, Date.UTC(2026, 8, 29, 10, 20));
  const newer = row("BTC", 5, Date.UTC(2026, 8, 29, 10, 25));
  const markets = deriveBinaryMarkets([older, newer], now);
  assert.equal(markets.length, 1);
  assert.equal(markets[0].id, "PERP_BTC5M_USDC");
  assert.equal(markets[0].hasLiveRow, false);
  // History anchors to the newest settled round.
  assert.equal(markets[0].currentRow.symbol, newer.symbol);

  const delisted = row("ETH", 5, Date.UTC(2026, 8, 29, 10, 30), "DELISTED");
  const delistedMarkets = deriveBinaryMarkets([delisted], now);
  assert.equal(delistedMarkets.length, 1);
  assert.equal(delistedMarkets[0].hasLiveRow, false);
  assert.equal(delistedMarkets[0].currentRow.symbol, delisted.symbol);
});

test("sorts live markets before history-only markets", () => {
  const btcHistory = row("BTC", 5, Date.UTC(2026, 8, 29, 10, 25));
  const ethLive = row("ETH", 5, Date.UTC(2026, 8, 29, 10, 35));
  const markets = deriveBinaryMarkets([btcHistory, ethLive], now);
  assert.deepEqual(
    markets.map((market) => ({ id: market.id, hasLiveRow: market.hasLiveRow })),
    [
      { id: "PERP_ETH5M_USDC", hasLiveRow: true },
      { id: "PERP_BTC5M_USDC", hasLiveRow: false },
    ],
  );
});

test("keeps history markets but excludes inconsistent records", () => {
  const start = Date.UTC(2026, 8, 29, 10, 35);
  const invalid = {
    ...row("ETH", 5, start),
    index_price_symbol: "PERP_BTC_USDC",
  };
  assert.equal(getBinaryMarketIdentity(invalid), null);
  assert.equal(
    getBinaryMarketIdentity({
      ...row("ETH", 5, start),
      observation_start_at: start + 60_000,
      expire_at: start + 360_000,
    }),
    null,
  );
  assert.equal(
    getBinaryMarketIdentity({
      ...row("ETH", 5, Date.UTC(2026, 2, 3)),
      symbol: "PERP_ETH5M2602310000_USDC",
    }),
    null,
  );
  // Expired and delisted rows keep the market listed; identity-invalid
  // records still never create a market.
  const markets = deriveBinaryMarkets(
    [row("BTC", 5, start - 600_000), row("BTC", 5, start, "DELISTED"), invalid],
    now,
  );
  assert.equal(markets.length, 1);
  assert.equal(markets[0].id, "PERP_BTC5M_USDC");
  assert.equal(markets[0].hasLiveRow, false);
  // Both rows are history-tier; the later-expiring delisted round wins.
  assert.equal(markets[0].currentRow.status, "DELISTED");
});

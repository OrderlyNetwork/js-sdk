import assert from "node:assert/strict";
import { test } from "node:test";
import type { BinaryMarket } from "./binary/binaryMarkets";
import {
  filterPredictionMarkets,
  formatBinarySymbolName,
  formatPredictionMarketName,
} from "./predictionMarketSearch";

const market = (overrides?: Partial<BinaryMarket>): BinaryMarket =>
  ({
    id: "PERP_BTC5M_USDC",
    base: "BTC",
    quote: "USDC",
    period: "5M",
    intervalSeconds: 300,
    indexPriceSymbol: "PERP_BTC_USDC",
    ...overrides,
  }) as BinaryMarket;

test("formatBinarySymbolName parses a round symbol into its market name", () => {
  assert.equal(
    formatBinarySymbolName("PERP_BTC5M2608271200_USDC"),
    "BTC UP/DOWN 5M",
  );
  assert.equal(
    formatBinarySymbolName("PERP_ETH15M2610091200_USDC"),
    "ETH UP/DOWN 15M",
  );
});

test("formatBinarySymbolName returns undefined for non-binary input", () => {
  assert.equal(formatBinarySymbolName("PERP_BTC_USDC"), undefined);
  assert.equal(formatBinarySymbolName("PERP_BTC5M2602301200_USDC"), undefined);
  assert.equal(formatBinarySymbolName(undefined), undefined);
  assert.equal(formatBinarySymbolName(""), undefined);
});

test("formatBinarySymbolName matches the market-object formatter", () => {
  assert.equal(
    formatBinarySymbolName("PERP_BTC5M2608271200_USDC"),
    formatPredictionMarketName(market()),
  );
});

test("filterPredictionMarkets matches the display name, id and index symbol", () => {
  const markets = [
    market(),
    market({
      id: "PERP_ETH10M_USDC",
      base: "ETH",
      period: "10M",
      intervalSeconds: 600,
      indexPriceSymbol: "PERP_ETH_USDC",
    }),
  ];
  assert.deepEqual(filterPredictionMarkets(markets, "btc up"), [markets[0]]);
  assert.deepEqual(filterPredictionMarkets(markets, "eth10m"), [markets[1]]);
  assert.deepEqual(filterPredictionMarkets(markets, "PERP_ETH_USDC"), [
    markets[1],
  ]);
  assert.deepEqual(filterPredictionMarkets(markets, "  "), markets);
  assert.deepEqual(filterPredictionMarkets(markets, "sol"), []);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  accumulateOrderBookLevels,
  fitOrderBookLevels,
  formatContracts,
  formatUsd,
  formatUsdAmount,
  formatPredictionPnl,
  INDEX_PRICE_DP_OVERRIDES,
  resolveIndexPriceDp,
} from "./predictionShared";

type BookRow = [number, number, number, number];

const isPlaceholderRow = (row: BookRow) =>
  row.every((value) => Number.isNaN(value));

const realRows = (count: number): BookRow[] =>
  Array.from({ length: count }, (_, index): BookRow => [index + 1, 10, 20, 30]);

test("fitOrderBookLevels pads empty levels to an all-placeholder column", () => {
  const rows = fitOrderBookLevels([], 7, "before");
  assert.equal(rows.length, 7);
  assert.ok(rows.every(isPlaceholderRow));
});

test("fitOrderBookLevels pads asks in front so best levels hug the price row", () => {
  const rows = fitOrderBookLevels(realRows(2), 5, "before");
  assert.equal(rows.length, 5);
  assert.ok(rows.slice(0, 3).every(isPlaceholderRow));
  assert.deepEqual(rows.slice(3), [
    [1, 10, 20, 30],
    [2, 10, 20, 30],
  ]);
});

test("fitOrderBookLevels pads bids at the end so best levels hug the price row", () => {
  const rows = fitOrderBookLevels(realRows(2), 5, "after");
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.slice(0, 2), [
    [1, 10, 20, 30],
    [2, 10, 20, 30],
  ]);
  assert.ok(rows.slice(2).every(isPlaceholderRow));
});

test("fitOrderBookLevels truncates deep asks keeping the best tail levels", () => {
  const rows = fitOrderBookLevels(realRows(6), 4, "before");
  assert.equal(rows.length, 4);
  // Best ask is last; only the worst two levels are dropped.
  assert.deepEqual(rows, [
    [3, 10, 20, 30],
    [4, 10, 20, 30],
    [5, 10, 20, 30],
    [6, 10, 20, 30],
  ]);
});

test("fitOrderBookLevels truncates deep bids keeping the best head levels", () => {
  const rows = fitOrderBookLevels(realRows(6), 4, "after");
  assert.equal(rows.length, 4);
  // Best bid is first; only the worst two levels are dropped.
  assert.deepEqual(rows, [
    [1, 10, 20, 30],
    [2, 10, 20, 30],
    [3, 10, 20, 30],
    [4, 10, 20, 30],
  ]);
});

test("fitOrderBookLevels is a no-op at exactly the target size", () => {
  const rows = fitOrderBookLevels(realRows(4), 4, "before");
  assert.equal(rows.length, 4);
  assert.ok(rows.every((row) => !isPlaceholderRow(row)));
});

test("fitOrderBookLevels never mutates the input rows", () => {
  const input = realRows(3);
  const original = JSON.stringify(input);
  fitOrderBookLevels(input, 6, "before");
  fitOrderBookLevels(input, 2, "after");
  assert.equal(JSON.stringify(input), original);
});

test("fitOrderBookLevels preserves accumulated rows from accumulateOrderBookLevels", () => {
  const accumulated = accumulateOrderBookLevels(
    [
      { price: 0.45, quantity: 5 },
      { price: 0.44, quantity: 15 },
    ],
    "backward",
  );
  const rows = fitOrderBookLevels(accumulated, 4, "before");
  assert.equal(rows.length, 4);
  assert.ok(rows.slice(0, 2).every(isPlaceholderRow));
  assert.deepEqual(rows.slice(2), accumulated);
});

test("truncated bids keep cumulative totals scoped to the visible window", () => {
  const accumulated = accumulateOrderBookLevels(
    [
      { price: 0.5, quantity: 1 },
      { price: 0.49, quantity: 2 },
      { price: 0.48, quantity: 4 },
      { price: 0.47, quantity: 8 },
    ],
    "forward",
  );
  const rows = fitOrderBookLevels(accumulated, 2, "after");
  // Worst visible row's cumulative = 1 + 2 = 3, NOT the whole-book 15.
  assert.equal(rows[1][2], 3);
});

test("truncated asks keep cumulative totals scoped to the visible window", () => {
  const accumulated = accumulateOrderBookLevels(
    [
      { price: 0.47, quantity: 8 },
      { price: 0.48, quantity: 4 },
      { price: 0.49, quantity: 2 },
      { price: 0.5, quantity: 1 },
    ],
    "backward",
  );
  const rows = fitOrderBookLevels(accumulated, 2, "before");
  // Worst visible row (first) accumulates from the best ask backward:
  // 1 + 2 = 3, NOT the whole-book 15.
  assert.equal(rows[0][2], 3);
});

test("resolveIndexPriceDp derives dp from the underlying perp quote_tick", () => {
  assert.equal(resolveIndexPriceDp("PERP_SOL_USDC", 0.001), 3);
  assert.equal(resolveIndexPriceDp("PERP_DOGE_USDC", 0.00001), 5);
  assert.equal(resolveIndexPriceDp(undefined, 0.1), 1);
});

test("resolveIndexPriceDp lets the override constants win over the tick", () => {
  assert.equal(
    resolveIndexPriceDp("PERP_BTC_USDC", 0.1),
    INDEX_PRICE_DP_OVERRIDES.PERP_BTC_USDC,
  );
  assert.equal(INDEX_PRICE_DP_OVERRIDES.PERP_BTC_USDC, 2);
});

test("resolveIndexPriceDp falls back to 2 dp without tick or override", () => {
  assert.equal(resolveIndexPriceDp("PERP_ETH_USDC", undefined), 2);
  assert.equal(resolveIndexPriceDp(undefined, undefined), 2);
  assert.equal(resolveIndexPriceDp("PERP_X_USDC", Number.NaN), 2);
  assert.equal(resolveIndexPriceDp("PERP_X_USDC", 0), 2);
});

test("paired index prices retain the digits deciding the result", () => {
  assert.equal(
    resolveIndexPriceDp("PERP_BTC_USDC", 0.1, 68000.123, 68000.124),
    3,
  );
  assert.equal(
    resolveIndexPriceDp("PERP_BTC_USDC", 0.1, 68000.12, 68000.12),
    2,
  );
  assert.equal(resolveIndexPriceDp("PERP_BTC_USDC", 0.1, undefined, NaN), 2);
  assert.equal(resolveIndexPriceDp("PERP_SOL_USDC", 0.0001, 100, 101), 4);
});

test("formatUsd renders grouped two-dp amounts via parseNumber truncation", () => {
  assert.equal(formatUsd(1234.567), "1,234.56");
  assert.equal(formatUsd(0), "0.00");
  assert.equal(formatUsd(-0.996), "-0.99");
});

test("formatUsd maps non-finite values to the placeholder", () => {
  assert.equal(formatUsd(Number.NaN), "--");
  assert.equal(formatUsd(Number.POSITIVE_INFINITY), "--");
});

test("formatContracts keeps up to 4 dp without zero padding", () => {
  assert.equal(formatContracts(1234567.89123), "1,234,567.8912");
  assert.equal(formatContracts(0.5), "0.5");
  assert.equal(formatContracts(2), "2");
  assert.equal(formatContracts(Number.NaN), "--");
});

test("USDC sub-cent amounts preserve the complete value without exponential notation", () => {
  for (const [value, expected] of [
    [0, "0.00"],
    [-0, "0.00"],
    [0.001485, "0.001485"],
    [-0.001485, "-0.001485"],
    [0.00000123, "0.00000123"],
    [-0.00000123, "-0.00000123"],
    [1e-12, "0.000000000001"],
    [-1e-12, "-0.000000000001"],
    [0.0099999, "0.0099999"],
    [-0.0099999, "-0.0099999"],
    [0.01, "0.01"],
    [-0.01, "-0.01"],
  ] as const) {
    assert.equal(formatUsd(value), expected);
  }
});

test("USDC assembly preserves validity, prefixes, suffixes and approximation", () => {
  assert.equal(
    formatUsdAmount(0.001485, {
      prefix: "$",
      suffix: " USDC",
      approximate: true,
    }),
    "≈ $0.001485 USDC",
  );
  for (const value of [null, undefined, NaN, Infinity, -Infinity]) {
    assert.equal(formatUsdAmount(value, { suffix: " USDC" }), "-- USDC");
  }
  assert.equal(formatUsdAmount(null, { placeholder: "N/A" }), "N/A");
});

test("PnL keeps small profits and losses raw and preserves ordinary PnL rounding", () => {
  for (const value of [
    0, -0, 0.001, -0.001, 0.001485, -0.00000123, 1e-12, -1e-12, 0.01, -0.01,
  ]) {
    assert.equal(formatPredictionPnl(value), formatUsd(value));
  }
  assert.equal(formatPredictionPnl(1.239), "1.23");
  assert.equal(formatPredictionPnl(-1.231), "-1.24");
  assert.equal(formatPredictionPnl(1234.567), "1,234.56");
  for (const value of [NaN, Infinity, -Infinity])
    assert.equal(formatPredictionPnl(value), "--");
});

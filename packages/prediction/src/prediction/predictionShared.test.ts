import assert from "node:assert/strict";
import { test } from "node:test";
import {
  accumulateOrderBookLevels,
  fitOrderBookLevels,
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

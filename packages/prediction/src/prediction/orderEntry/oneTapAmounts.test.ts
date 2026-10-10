import assert from "node:assert/strict";
import { test } from "node:test";
import {
  alignOneTapAmounts,
  resolveOneTapAmounts,
  validOneTapAmounts,
} from "./oneTapAmounts";

test("validOneTapAmounts accepts 1-3 finite amounts within bounds", () => {
  assert.equal(validOneTapAmounts([10]), true);
  assert.equal(validOneTapAmounts([10, 50, 100]), true);
  assert.equal(validOneTapAmounts([1, 99999.99]), true);
});

test("validOneTapAmounts rejects non-arrays, wrong lengths, and out-of-range values", () => {
  assert.equal(validOneTapAmounts(undefined), false);
  assert.equal(validOneTapAmounts("10"), false);
  assert.equal(validOneTapAmounts([]), false);
  assert.equal(validOneTapAmounts([10, 50, 100, 500]), false);
  assert.equal(validOneTapAmounts([0.99]), false);
  assert.equal(validOneTapAmounts([100000]), false);
  assert.equal(validOneTapAmounts([Number.NaN]), false);
});

test("legacy flat-array presets fall back to defaults", () => {
  assert.deepEqual(resolveOneTapAmounts([10, 50, 100], "up"), [10]);
  assert.deepEqual(resolveOneTapAmounts([10, 100, 1000], "down"), [10]);
});

test("custom legacy flat arrays survive the migration", () => {
  assert.deepEqual(resolveOneTapAmounts([25, 75], "up"), [25, 75]);
});

test("object storage resolves per outcome and falls back per outcome", () => {
  const stored = { up: [5, 15], down: [0] };
  assert.deepEqual(resolveOneTapAmounts(stored, "up"), [5, 15]);
  assert.deepEqual(resolveOneTapAmounts(stored, "down"), [10]);
});

test("alignOneTapAmounts pads the shorter side from the opposite column", () => {
  assert.deepEqual(alignOneTapAmounts([5, 15, 25], [8]), {
    up: [5, 15, 25],
    down: [8, 15, 25],
  });
});

test("alignOneTapAmounts mirrors the opposite column for an empty side", () => {
  assert.deepEqual(alignOneTapAmounts([1, 2, 3], []), {
    up: [1, 2, 3],
    down: [1, 2, 3],
  });
});

test("editor text rejects invalid precision, out-of-range and mismatched rows without rounding", async () => {
  const { parseOneTapDraft } = await import("./oneTapAmounts");
  for (const value of [
    "",
    "0",
    "1.234",
    "1e2",
    "Infinity",
    "100000",
    "-1",
    ".5",
  ])
    assert.equal(parseOneTapDraft({ up: [value], down: ["10"] }), undefined);
  assert.equal(parseOneTapDraft({ up: ["10", "20"], down: ["10"] }), undefined);
  assert.deepEqual(parseOneTapDraft({ up: [" 12.34 "], down: ["99999.99"] }), {
    up: [12.34],
    down: [99999.99],
  });
});

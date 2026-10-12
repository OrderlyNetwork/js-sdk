import assert from "node:assert/strict";
import test from "node:test";
import { MarginMode, type API } from "@orderly.network/types";
import {
  loadBinaryPendingSnapshot,
  mergeManagedPredictionPositions,
  predictionPositionKey,
  toPredictionPosition,
} from "./binaryManagedPositions";

const symbol = "PERP_BTC5M2610120755_USDC";
const position = (changes: Partial<API.PositionExt> = {}) =>
  ({
    symbol,
    position_qty: 3.42,
    average_open_price: 0.59,
    mark_price: 0.63,
    margin_mode: MarginMode.ISOLATED,
    account_id: "sub",
    ...changes,
  }) as API.PositionExt;

test("aggregate duplicates never overwrite the current account's live positions", () => {
  const live = toPredictionPosition(
    position({ account_id: "main", position_qty: 10 }),
  );
  const rows = mergeManagedPredictionPositions(
    [live],
    [position({ account_id: "main", position_qty: 99 }), position()],
    "main",
    ["sub"],
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].quantity, 10);
  assert.notEqual(
    predictionPositionKey(rows[0]),
    predictionPositionKey(rows[1]),
  );
  assert.equal(rows[1].marginMode, MarginMode.ISOLATED);
});
test("closed live positions are not resurrected by an old aggregate row", () => {
  assert.deepEqual(
    mergeManagedPredictionPositions(
      [],
      [position({ account_id: "main" })],
      "main",
      ["sub"],
    ),
    [],
  );
});
test("only authorized nonzero Binary children are merged", () => {
  const rows = mergeManagedPredictionPositions(
    [],
    [
      position({ position_qty: 0 }),
      position({ symbol: "PERP_ETH_USDC" }),
      position({ account_id: "unknown" }),
      position({ account_id: undefined }),
      position(),
      position(),
    ],
    "main",
    ["sub"],
  );
  assert.equal(rows.length, 1);
  assert.equal(
    mergeManagedPredictionPositions([], [position()], "sub", []).length,
    0,
  );
  assert.deepEqual(
    mergeManagedPredictionPositions([], [position()], undefined, ["sub"]),
    [],
  );
});
test("DOWN keeps the owner and converts quantity, entry and mark to outcome coordinates", () => {
  const down = toPredictionPosition(position({ position_qty: -2 }));
  assert.equal(down.outcome, "down");
  assert.equal(down.quantity, 2);
  assert.equal(down.averagePrice, 0.41);
  assert.equal(down.markPrice, 0.37);
  assert.equal(down.accountId, "sub");
});
test("pending risk snapshots load beyond 100 and deduplicate page overlap", async () => {
  const orders = Array.from(
    { length: 125 },
    (_, order_id) => ({ order_id, symbol }) as API.Order,
  );
  const pages: number[] = [];
  const result = await loadBinaryPendingSnapshot(
    { rows: orders.slice(0, 100), meta: { total: 125 } },
    async (page) => {
      pages.push(page);
      return { rows: orders.slice(99), meta: { total: 125 } };
    },
  );
  assert.deepEqual(pages, [2]);
  assert.equal(result.rows.length, 125);
});
test("empty pending accounts are complete without another request", async () => {
  assert.deepEqual(
    await loadBinaryPendingSnapshot(
      { rows: [], meta: { total: 0 } },
      async () => {
        throw new Error("unexpected");
      },
    ),
    { rows: [], meta: { total: 0 } },
  );
});
test("missing metadata, incomplete pages and foreign-product contamination fail closed", async () => {
  const fetch = async () => ({ rows: [], meta: { total: 2 } });
  await assert.rejects(
    loadBinaryPendingSnapshot({ rows: [], meta: {} } as any, fetch),
  );
  await assert.rejects(
    loadBinaryPendingSnapshot(
      { rows: [{ order_id: 1, symbol }] as API.Order[], meta: { total: 2 } },
      fetch,
    ),
  );
  await assert.rejects(
    loadBinaryPendingSnapshot(
      {
        rows: [{ order_id: 1, symbol: "PERP_ETH_USDC" }] as API.Order[],
        meta: { total: 1 },
      },
      fetch,
    ),
  );
});
test("a query failure is propagated instead of being returned as an empty account", async () => {
  await assert.rejects(
    loadBinaryPendingSnapshot(
      { rows: [{ order_id: 1, symbol }] as API.Order[], meta: { total: 2 } },
      async () => {
        throw new Error("permission denied");
      },
    ),
    /permission denied/,
  );
});

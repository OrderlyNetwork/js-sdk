import assert from "node:assert/strict";
import test from "node:test";
import {
  OrderSide,
  OrderStatus,
  OrderType,
  type API,
} from "@orderly.network/types";
import { matchesBinaryDisplaySide } from "../../binary/binaryOrderDisplay";
import type { usePredictionFilters } from "../../predictionFilters.script";
import { matchesPredictionOrderFilters } from "./matchesPredictionOrderFilters";

const apiOrder = (changes: Partial<API.Order> = {}) =>
  ({
    order_id: 1,
    symbol: "PERP_BTC5M2610081200_USDC",
    side: OrderSide.BUY,
    type: OrderType.IOC,
    price: 0.55,
    quantity: 100,
    total_executed_quantity: 0,
    status: OrderStatus.NEW,
    created_time: 1,
    ...changes,
  }) as API.Order;

// buyUp / buyDown / sellUp / sellDown name the DISPLAYED action and outcome;
// the underlying API side differs for three of the four (single UP book).
const buyUp = apiOrder({ side: OrderSide.BUY });
const buyDown = apiOrder({ side: OrderSide.SELL });
const sellUp = {
  ...apiOrder({ side: OrderSide.SELL }),
  reduce_only: true,
};
const sellDown = {
  ...apiOrder({ side: OrderSide.BUY }),
  reduce_only: true,
};

test("matchesBinaryDisplaySide filters by reduce-only, not by API side", () => {
  for (const [row, buy, sell] of [
    [buyUp, true, false],
    [buyDown, true, false],
    [sellUp, false, true],
    [sellDown, false, true],
  ] as const) {
    assert.equal(
      matchesBinaryDisplaySide(row, OrderSide.BUY),
      buy,
      row.order_id,
    );
    assert.equal(
      matchesBinaryDisplaySide(row, OrderSide.SELL),
      sell,
      row.order_id,
    );
    assert.equal(matchesBinaryDisplaySide(row, undefined), true, row.order_id);
  }
});

test("matchesBinaryDisplaySide tolerates non-sides and missing reduce_only", () => {
  // Shared-panel callers pass `OrderSide | "all"` straight through.
  assert.equal(matchesBinaryDisplaySide(sellUp, "all" as OrderSide), true);
  // Missing reduce_only defaults to Buy, same as binaryOrderDisplaySide.
  const sparse = apiOrder({ side: OrderSide.SELL });
  delete (sparse as { reduce_only?: boolean }).reduce_only;
  assert.equal(matchesBinaryDisplaySide(sparse, OrderSide.BUY), true);
  assert.equal(matchesBinaryDisplaySide(sparse, OrderSide.SELL), false);
});

const filtersWithSide = (side: string) => {
  const seen: string[] = [];
  const filters = {
    side,
    status: "all",
    // Mirror only the side clause of usePredictionFilters().matches; the
    // override under test is what feeds `side` into records like this.
    matches: (record: { side?: string }) => {
      seen.push(record.side ?? "");
      return side === "all" || record.side === side;
    },
  } as unknown as ReturnType<typeof usePredictionFilters>;
  return { filters, seen };
};

test("matchesPredictionOrderFilters feeds filters the displayed action", () => {
  for (const [side, expected] of [
    ["buy", [true, true, false, false]],
    ["sell", [false, false, true, true]],
    ["all", [true, true, true, true]],
  ] as const) {
    const { filters, seen } = filtersWithSide(side);
    const results = [buyUp, buyDown, sellUp, sellDown].map((row) =>
      matchesPredictionOrderFilters(filters, row),
    );
    assert.deepEqual(results, [...expected]);
    // Every record reached the predicate with the display side, never the
    // raw API side (buyDown would arrive as "sell" without the override).
    assert.deepEqual(seen, ["buy", "buy", "sell", "sell"]);
  }
});

test("matchesPredictionOrderFilters keeps the pending status mapping", () => {
  const partial = apiOrder({ status: OrderStatus.PARTIAL_FILLED });
  const statuses: string[] = [];
  const capturing = {
    side: "all",
    status: "pending",
    matches: (record: { status?: string }) => {
      statuses.push(record.status ?? "");
      return true;
    },
  } as unknown as ReturnType<typeof usePredictionFilters>;
  matchesPredictionOrderFilters(capturing, partial);
  assert.deepEqual(statuses, ["pending"]);
});

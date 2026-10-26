import assert from "node:assert/strict";
import test from "node:test";
import { AlgoOrderRootType, type API } from "@orderly.network/types";
import {
  cancelProductTargets,
  cancellationOrdersSnapshot,
  productCancellationTargets,
  type ProductCancellationSnapshot,
} from "./productOrderCancellation";

const live = "PERP_BTC5M2610091200_USDC";
const closed = "PERP_BTC5M2610091155_USDC";
const snapshot = (
  patch: Partial<ProductCancellationSnapshot> = {},
): ProductCancellationSnapshot => ({
  perps: [
    { symbol: "PERP_BTC_USDC" },
    { symbol: "PERP_BTC_USDC" },
    {
      symbol: "PERP_ETH_USDC",
      algo_order_id: 1,
      algo_type: AlgoOrderRootType.STOP,
    },
    { symbol: live },
  ],
  perpsComplete: true,
  binary: [{ symbol: live }, { symbol: closed }],
  binaryComplete: true,
  includePrediction: true,
  regionRestricted: false,
  isBinaryTradable: (symbol) => symbol === live,
  ...patch,
});

test("pending pagination must cover unique ordinary and algo orders before cancelling", () => {
  const order = { order_id: 1, symbol: "PERP_BTC_USDC" } as API.Order;
  const algo = {
    algo_order_id: 1,
    symbol: "PERP_ETH_USDC",
    algo_type: AlgoOrderRootType.STOP,
  } as API.AlgoOrder;
  const page = (
    rows: API.OrderResponse["rows"],
    total = 2,
  ): API.OrderResponse => ({
    rows,
    meta: { total, current_page: 1, records_per_page: 100 },
  });
  assert.equal(cancellationOrdersSnapshot(undefined).complete, false);
  assert.equal(cancellationOrdersSnapshot([page([])]).complete, false);
  assert.equal(
    cancellationOrdersSnapshot([page([order]), page([order])]).complete,
    false,
  );
  assert.equal(
    cancellationOrdersSnapshot([page([order]), page([algo])]).complete,
    true,
  );
  assert.equal(cancellationOrdersSnapshot([page([], 0)]).complete, true);
  for (const malformed of [
    { rows: [order] },
    { meta: { total: 1 } },
    page([order], -1),
    page([order], NaN),
  ]) {
    assert.equal(
      cancellationOrdersSnapshot([malformed as API.OrderResponse]).complete,
      false,
    );
  }
});

test("mixed cancel-all deduplicates symbols, excludes polluted PERP rows and skips closed rounds", async () => {
  const calls: string[] = [];
  const result = await cancelProductTargets(
    () => productCancellationTargets(snapshot()),
    async (symbol) => {
      calls.push(`orders:${symbol}`);
      return { success: true };
    },
    async (symbol, type) => {
      calls.push(`${type}:${symbol}`);
      return { success: true };
    },
  );
  assert.equal(result, true);
  assert.deepEqual(calls, [
    "orders:PERP_BTC_USDC",
    "STOP:PERP_BTC_USDC",
    "TRAILING_STOP:PERP_BTC_USDC",
    "orders:PERP_ETH_USDC",
    "STOP:PERP_ETH_USDC",
    "TRAILING_STOP:PERP_ETH_USDC",
    `orders:${live}`,
  ]);
});

test("incomplete snapshots and Binary region restrictions prevent all mixed mutations", async () => {
  for (const patch of [
    { perpsComplete: false },
    { binaryComplete: false },
    { regionRestricted: true },
  ]) {
    let calls = 0;
    assert.equal(
      await cancelProductTargets(
        () => productCancellationTargets(snapshot(patch)),
        async () => {
          calls++;
        },
        async () => {
          calls++;
        },
      ),
      false,
    );
    assert.equal(calls, 0);
  }
  assert.deepEqual(
    productCancellationTargets(
      snapshot({
        includePrediction: false,
        regionRestricted: true,
        binaryComplete: false,
      }),
    ),
    [
      { product: "PERP", symbol: "PERP_BTC_USDC" },
      { product: "PERP", symbol: "PERP_ETH_USDC" },
    ],
  );
});

test("a round closing in flight is skipped and a new restriction stops subsequent symbols", async () => {
  let current = snapshot();
  const calls: string[] = [];
  await cancelProductTargets(
    () => productCancellationTargets(current),
    async (symbol) => {
      calls.push(symbol);
      current = { ...current, isBinaryTradable: () => false };
      return { success: true };
    },
    async () => ({ success: true }),
  );
  assert.deepEqual(calls, ["PERP_BTC_USDC", "PERP_ETH_USDC"]);
  current = snapshot();
  calls.length = 0;
  const result = await cancelProductTargets(
    () => productCancellationTargets(current),
    async (symbol) => {
      calls.push(symbol);
      current = { ...current, regionRestricted: true };
      return { success: true };
    },
    async () => ({ success: true }),
  );
  assert.equal(result, false);
  assert.deepEqual(calls, ["PERP_BTC_USDC"]);
});

test("backend cancellation failures retain their message and stop subsequent symbols", async () => {
  const calls: string[] = [];
  await assert.rejects(
    cancelProductTargets(
      () => productCancellationTargets(snapshot()),
      async (symbol) => {
        calls.push(symbol);
        return { success: false, message: "CANCEL_REJECTED" };
      },
      async () => ({ success: true }),
    ),
    /CANCEL_REJECTED/,
  );
  assert.deepEqual(calls, ["PERP_BTC_USDC"]);
});

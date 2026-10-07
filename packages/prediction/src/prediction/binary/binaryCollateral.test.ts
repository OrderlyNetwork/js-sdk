import assert from "node:assert/strict";
import test from "node:test";
import { MarginMode, OrderSide, type API } from "@orderly.network/types";
import {
  availableBinaryCloseQuantity,
  estimateBinaryOrderFrozen,
  maxBinaryOrderQuantity,
  resolveBinaryCollateral,
  type BinaryCollateralSnapshot,
} from "./binaryCollateral";

const symbol = "PERP_BTC5M2610070000_USDC";
const position = (overrides: Partial<API.Position> = {}) =>
  ({
    symbol,
    position_qty: 100,
    pending_long_qty: 0,
    pending_short_qty: 0,
    mark_price: 0.5,
    margin_mode: MarginMode.ISOLATED,
    ...overrides,
  }) as API.Position;
const order = (overrides: Partial<API.Order> = {}) =>
  ({
    symbol,
    order_id: 1,
    side: OrderSide.SELL,
    price: 0.8,
    quantity: 60,
    total_executed_quantity: 0,
    created_time: 100,
    updated_time: 100,
    status: "NEW",
    margin_mode: MarginMode.ISOLATED,
    ...overrides,
  }) as API.Order;
const snapshot = (
  positionQty: number,
  orders: BinaryCollateralSnapshot["orders"] = [],
): BinaryCollateralSnapshot => ({
  positionQty,
  orders,
  pendingBuyQty: 0,
  pendingSellQty: 0,
  reservations: [],
  mode: "detailed",
});
const frozen = (
  state: BinaryCollateralSnapshot,
  side: OrderSide,
  price: number,
  quantity: number,
) => estimateBinaryOrderFrozen(state, side, price, quantity)!.toNumber();

test("BUY uses p and SELL uses 1-p, with per-order USDC rounding", () => {
  assert.equal(frozen(snapshot(0), OrderSide.BUY, 0.1, 100), 10.006);
  assert.equal(frozen(snapshot(0), OrderSide.SELL, 0.1, 100), 90.054);
  assert.equal(frozen(snapshot(0), OrderSide.SELL, 0.9, 100), 10.006);
  assert.equal(frozen(snapshot(0), OrderSide.BUY, 0.9, 100), 90.054);
  assert.equal(frozen(snapshot(0), OrderSide.BUY, 0.3333333, 0.01), 0.003336);
});

test("reverse orders freeze only the opening remainder on either holding side", () => {
  assert.equal(frozen(snapshot(100), OrderSide.SELL, 0.6, 100), 0);
  assert.equal(frozen(snapshot(100), OrderSide.SELL, 0.6, 140), 16.0096);
  assert.equal(frozen(snapshot(-100), OrderSide.BUY, 0.6, 100), 0);
  assert.equal(frozen(snapshot(-100), OrderSide.BUY, 0.6, 140), 24.0144);
});

test("new orders reallocate existing reverse orders using UP price priority", () => {
  const state = snapshot(100, [
    {
      side: OrderSide.SELL,
      referencePrice: 0.8,
      quantity: 60,
      createdTime: 100,
    },
  ]);
  // The lower UP price closes first; the old order opens 40 at DOWN 0.2.
  assert.equal(frozen(state, OrderSide.SELL, 0.6, 80), 8.0048);
  const short = snapshot(-100, [
    {
      side: OrderSide.BUY,
      referencePrice: 0.2,
      quantity: 60,
      createdTime: 100,
    },
  ]);
  assert.equal(frozen(short, OrderSide.BUY, 0.6, 80), 8.0048);
});

test("already frozen opening margin is subtracted, including displaced pending quantity", () => {
  const state = snapshot(100, [
    { side: OrderSide.SELL, referencePrice: 0.8, quantity: 140 },
  ]);
  // F_before = 8.0048; F_after = 24.0144; only the difference is additional.
  assert.equal(frozen(state, OrderSide.SELL, 0.6, 80), 16.0096);
  const flat = snapshot(0, [
    { side: OrderSide.BUY, referencePrice: 0.5, quantity: 100 },
  ]);
  assert.equal(frozen(flat, OrderSide.BUY, 0.6, 20), 12.0072);
});

test("each opening order rounds up before summing", () => {
  const tiny = snapshot(0, [
    { side: OrderSide.BUY, referencePrice: 0.3333333, quantity: 0.01 },
  ]);
  assert.equal(frozen(tiny, OrderSide.BUY, 0.3333333, 0.01), 0.003336);
});

test("Max preserves pure closing with zero collateral and caps extra opening", () => {
  for (const [positionQty, side] of [
    [100, OrderSide.SELL],
    [-100, OrderSide.BUY],
  ] as const) {
    assert.equal(
      maxBinaryOrderQuantity({
        snapshot: snapshot(positionQty),
        side,
        upPrice: 0.6,
        balance: 0,
      }),
      100,
    );
  }
  assert.equal(
    maxBinaryOrderQuantity({
      snapshot: snapshot(0),
      side: OrderSide.BUY,
      upPrice: 0.6,
      balance: 0,
    }),
    0,
  );
  const state = snapshot(100, [
    { side: OrderSide.SELL, referencePrice: 0.8, quantity: 60 },
  ]);
  assert.equal(
    maxBinaryOrderQuantity({
      snapshot: state,
      side: OrderSide.SELL,
      upPrice: 0.6,
      balance: 0,
    }),
    40,
  );
  const max = maxBinaryOrderQuantity({
    snapshot: state,
    side: OrderSide.SELL,
    upPrice: 0.6,
    balance: 8.0048,
  });
  assert.ok(max >= 79 && max < 80);
  assert.ok(
    estimateBinaryOrderFrozen(state, OrderSide.SELL, 0.6, max)!.lte(8.0048),
  );
  assert.equal(
    maxBinaryOrderQuantity({
      snapshot: snapshot(100),
      side: OrderSide.SELL,
      upPrice: 0.6,
      balance: 0,
      baseMax: 50,
    }),
    50,
  );
});

test("Max floors to metadata tick and returned size remains affordable", () => {
  const state = snapshot(0);
  const max = maxBinaryOrderQuantity({
    snapshot: state,
    side: OrderSide.BUY,
    upPrice: 0.6,
    balance: 90,
    baseTick: 0.1,
    baseMax: 123.4,
  });
  assert.ok(max <= 123.4);
  assert.ok(Math.abs(max * 10 - Math.round(max * 10)) < 1e-8);
  assert.ok(estimateBinaryOrderFrozen(state, OrderSide.BUY, 0.6, max)!.lte(90));
});

test("detailed inputs deduplicate and use remaining quantity; RO counts toward coverage", () => {
  const pending = order({ quantity: 80, total_executed_quantity: 20 });
  const ro = order({ order_id: 2, quantity: 30, reduce_only: true });
  const state = resolveBinaryCollateral({
    symbol,
    positions: [position({ pending_short_qty: 90 })],
    orders: [pending, pending, ro],
    ordersComplete: false,
  })!;
  assert.equal(state.mode, "detailed");
  assert.equal(state.pendingSellQty, 90);
  assert.equal(state.orders.length, 1);
  assert.equal(state.orders[0].quantity, 60);
  assert.equal(frozen(state, OrderSide.SELL, 0.6, 80), 8.0048);
  assert.equal(availableBinaryCloseQuantity(state, OrderSide.SELL), 10);
  assert.equal(availableBinaryCloseQuantity(state, OrderSide.SELL, 1), 70);
});

test("RO compatibility is explicit: ordinary Max and funding exclude RO, explicit exit reserves it", () => {
  const state = resolveBinaryCollateral({
    symbol,
    positions: [position({ pending_short_qty: 60 })],
    orders: [order({ reduce_only: true })],
    ordersComplete: true,
  })!;
  assert.equal(frozen(state, OrderSide.SELL, 0.6, 100), 0);
  assert.equal(
    maxBinaryOrderQuantity({
      snapshot: state,
      side: OrderSide.SELL,
      upPrice: 0.6,
      balance: 0,
    }),
    100,
  );
  assert.equal(frozen(state, OrderSide.SELL, 0.6, 140), 16.0096);
  assert.equal(availableBinaryCloseQuantity(state, OrderSide.SELL), 40);
  assert.equal(availableBinaryCloseQuantity(state, OrderSide.BUY), 0);
  assert.equal(availableBinaryCloseQuantity(state, OrderSide.SELL, 1), 100);
});

test("incomplete coverage uses aggregate at Mark without adding loaded orders twice", () => {
  const inputs = {
    symbol,
    positions: [position({ pending_short_qty: 60 })],
    orders: [order({ quantity: 20 })],
    ordersComplete: false,
  };
  const low = resolveBinaryCollateral({ ...inputs, markPrice: 0.5 })!;
  const high = resolveBinaryCollateral({ ...inputs, markPrice: 0.9 })!;
  assert.equal(low.mode, "approximate");
  assert.equal(low.orders.length, 1);
  assert.equal(low.orders[0].quantity, 60);
  assert.equal(frozen(low, OrderSide.SELL, 0.6, 80), 16.0096);
  assert.equal(frozen(high, OrderSide.SELL, 0.6, 80), 4.0024);
  assert.equal(availableBinaryCloseQuantity(low, OrderSide.SELL), 40);
  const detailed = resolveBinaryCollateral({ ...inputs, orders: [order()] })!;
  assert.equal(detailed.mode, "detailed");
  assert.equal(frozen(detailed, OrderSide.SELL, 0.6, 80), 8.0048);
});

test("pending-only rows survive; other rounds do not contribute holding", () => {
  const state = resolveBinaryCollateral({
    symbol,
    positions: [position({ position_qty: 0, pending_long_qty: 10 })],
    orders: undefined,
    ordersComplete: false,
  })!;
  assert.equal(state.orders[0].quantity, 10);
  assert.equal(frozen(state, OrderSide.BUY, 0.6, 20), 12.0072);
  const other = resolveBinaryCollateral({
    symbol,
    positions: [position({ symbol: "OTHER" })],
    orders: [order({ symbol: "OTHER" })],
    ordersComplete: true,
  })!;
  assert.equal(other.positionQty, 0);
  assert.equal(frozen(other, OrderSide.SELL, 0.6, 100), 40.024);
});

test("missing fields force fallback without discarding observed pending quantity", () => {
  for (const overrides of [
    { created_time: NaN },
    { price: null },
    { margin_mode: undefined },
  ]) {
    const state = resolveBinaryCollateral({
      symbol,
      positions: [position()],
      orders: [order(overrides)],
      ordersComplete: true,
    })!;
    assert.equal(state.mode, "approximate");
    assert.equal(state.orders[0].quantity, 60);
  }
});

test("latest duplicate wins and terminal orders cannot reserve closing shares", () => {
  const old = order({ quantity: 80, updated_time: 100 });
  const newer = order({
    quantity: 80,
    total_executed_quantity: 40,
    updated_time: 200,
  });
  const state = resolveBinaryCollateral({
    symbol,
    positions: [position()],
    orders: [newer, old, order({ order_id: 2, status: "CANCELLED" })],
    ordersComplete: true,
  })!;
  assert.equal(state.orders[0].quantity, 40);
  assert.equal(availableBinaryCloseQuantity(state, OrderSide.SELL), 60);
});

test("unloaded snapshot and pending without Mark are unavailable; truly flat needs no Mark", () => {
  assert.equal(
    resolveBinaryCollateral({
      symbol,
      positions: undefined,
      orders: [],
      ordersComplete: true,
    }),
    undefined,
  );
  assert.equal(
    resolveBinaryCollateral({
      symbol,
      positions: [position({ pending_short_qty: 60, mark_price: NaN })],
      orders: undefined,
      ordersComplete: false,
    }),
    undefined,
  );
  assert.equal(
    resolveBinaryCollateral({
      symbol,
      positions: [],
      orders: undefined,
      ordersComplete: false,
    })?.mode,
    "approximate",
  );
  assert.equal(
    resolveBinaryCollateral({
      symbol,
      positions: [position({ margin_mode: MarginMode.CROSS })],
      orders: [],
      ordersComplete: true,
    }),
    undefined,
  );
});

test("invalid balance and prices cannot create a positive Max", () => {
  for (const balance of [-1, NaN, Infinity]) {
    assert.equal(
      maxBinaryOrderQuantity({
        snapshot: snapshot(100),
        side: OrderSide.SELL,
        upPrice: 0.6,
        balance,
      }),
      0,
    );
  }
  assert.equal(
    estimateBinaryOrderFrozen(undefined, OrderSide.BUY, 0.5, 10),
    undefined,
  );
  assert.equal(
    estimateBinaryOrderFrozen(snapshot(0), OrderSide.BUY, Infinity, 10),
    undefined,
  );
  assert.equal(availableBinaryCloseQuantity(undefined, OrderSide.SELL), 0);
});

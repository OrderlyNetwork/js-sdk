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
  assert.equal(max, 80);
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
  assert.equal(state.orders.length, 2);
  assert.equal(state.orders[0].quantity, 60);
  assert.equal(state.orders[1].quantity, 30);
  assert.equal(state.orders[1].reduceOnly, true);
  assert.equal(frozen(state, OrderSide.SELL, 0.6, 80), 8.0048);
  assert.equal(availableBinaryCloseQuantity(state, OrderSide.SELL), 10);
  assert.equal(availableBinaryCloseQuantity(state, OrderSide.SELL, 1), 70);
});

test("signed sell aggregates reserve only the pending shares of an UP holding", () => {
  for (const quantity of [7.93, 15.87, 20]) {
    for (const sign of [-1, 1]) {
      const state = resolveBinaryCollateral({
        symbol,
        positions: [
          position({
            position_qty: 15.87,
            pending_short_qty: sign * quantity,
          }),
        ],
        orders: [order({ quantity, reduce_only: true })],
        ordersComplete: true,
      });
      assert.ok(state);
      assert.equal(state.mode, "detailed");
      assert.equal(state.pendingSellQty, quantity);
      assert.equal(
        availableBinaryCloseQuantity(state, OrderSide.SELL),
        quantity === 7.93 ? 7.94 : 0,
      );
      assert.equal(
        availableBinaryCloseQuantity(state, OrderSide.SELL, 1),
        15.87,
      );
      assert.equal(availableBinaryCloseQuantity(state, OrderSide.BUY), 0);
    }
  }
});

test("signed sell aggregates preserve reservations while order data catches up", () => {
  for (const quantity of [0, 3, 10]) {
    const state = resolveBinaryCollateral({
      symbol,
      positions: [position({ position_qty: 15.87, pending_short_qty: -7.93 })],
      orders: quantity ? [order({ quantity, reduce_only: true })] : undefined,
      ordersComplete: false,
    });
    assert.ok(state);
    assert.equal(state.mode, quantity < 7.93 ? "approximate" : "detailed");
    assert.equal(state.pendingSellQty, Math.max(7.93, quantity));
    assert.equal(
      availableBinaryCloseQuantity(state, OrderSide.SELL),
      quantity > 7.93 ? 5.87 : 7.94,
    );
  }
});

test("invalid sell aggregates remain unavailable after signed quantity normalization", () => {
  for (const quantity of [NaN, Infinity, -Infinity, "7.93"]) {
    assert.equal(
      resolveBinaryCollateral({
        symbol,
        positions: [position({ pending_short_qty: quantity as number })],
        orders: [],
        ordersComplete: true,
      }),
      undefined,
    );
  }
});

test("RO joins the allocation at zero frozen; priority decides who is displaced", () => {
  // The RO sell sits at a worse UP price than the new order: the new order
  // closes first, the displaced RO excess freezes nothing, so the ordinary
  // Max and funding numbers are unchanged by the RO order's presence.
  const state = resolveBinaryCollateral({
    symbol,
    positions: [position({ pending_short_qty: 60 })],
    orders: [order({ reduce_only: true })],
    ordersComplete: true,
  })!;
  assert.equal(state.orders.length, 1);
  assert.equal(state.orders[0].reduceOnly, true);
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

  // A better-priority RO sell claims the holding first (SELL: lower UP price
  // wins): only the unclaimed remainder stays free, the rest of the new
  // order opens and freezes — the RO gap fix.
  const claimed = resolveBinaryCollateral({
    symbol,
    positions: [position({ pending_short_qty: 60 })],
    orders: [order({ reduce_only: true, price: 0.4 })],
    ordersComplete: true,
  })!;
  assert.equal(frozen(claimed, OrderSide.SELL, 0.6, 100), 24.0144);
  assert.equal(
    maxBinaryOrderQuantity({
      snapshot: claimed,
      side: OrderSide.SELL,
      upPrice: 0.6,
      balance: 0,
    }),
    40,
  );

  // An over-sized RO claim never freezes itself, even when a better-priority
  // order displaces its excess beyond the holding.
  const overClaimed = resolveBinaryCollateral({
    symbol,
    positions: [position({ pending_short_qty: 120 })],
    orders: [order({ reduce_only: true, price: 0.4, quantity: 120 })],
    ordersComplete: true,
  })!;
  assert.equal(frozen(overClaimed, OrderSide.SELL, 0.3, 10), 0);
});

test("fallback retains observed prices and aggregates only unobserved quantities", () => {
  const state = resolveBinaryCollateral({
    symbol,
    positions: [position({ pending_short_qty: 60 })],
    orders: [
      order({ quantity: 20 }),
      order({ order_id: 2, quantity: 30, reduce_only: true }),
    ],
    ordersComplete: false,
    markPrice: 0.5,
  })!;
  assert.equal(state.mode, "approximate");
  assert.equal(state.orders.length, 3);
  assert.equal(state.orders[0].reduceOnly, undefined);
  assert.equal(state.orders[0].quantity, 20);
  assert.equal(state.orders[0].referencePrice, 0.8);
  assert.equal(state.orders[1].reduceOnly, true);
  assert.equal(state.orders[1].quantity, 30);
  assert.equal(state.orders[1].referencePrice, 0.8);
  assert.equal(state.orders[2].quantity, 10);
  assert.equal(state.orders[2].referencePrice, 0.5);
  // The aggregate closes 10, the new order closes 80, and 10 of the known
  // ordinary order opens at DOWN 0.2. The displaced RO remainder stays free.
  assert.equal(frozen(state, OrderSide.SELL, 0.6, 80), 2.0012);
});

test("fallback preserves known RO price priority when order metadata is missing", () => {
  for (const [positionQty, side, roPrice, upPrice] of [
    [100, OrderSide.SELL, 0.4, 0.45],
    [-100, OrderSide.BUY, 0.6, 0.55],
  ] as const) {
    for (const missing of [{ created_time: NaN }, { margin_mode: undefined }]) {
      const state = resolveBinaryCollateral({
        symbol,
        positions: [
          position({
            position_qty: positionQty,
            pending_long_qty: side === OrderSide.BUY ? 60 : 0,
            pending_short_qty: side === OrderSide.SELL ? 60 : 0,
          }),
        ],
        orders: [
          order({
            side,
            price: roPrice,
            quantity: 80,
            total_executed_quantity: 20,
            reduce_only: true,
            ...missing,
          }),
        ],
        ordersComplete: true,
      })!;
      assert.equal(state.mode, "approximate");
      assert.equal(state.orders[0].referencePrice, roPrice);
      assert.equal(state.orders[0].quantity, 60);
      assert.equal(frozen(state, side, upPrice, 100), 33.0198);
      assert.equal(
        maxBinaryOrderQuantity({ snapshot: state, side, upPrice, balance: 0 }),
        40,
      );
    }
  }
});

test("fallback reserves RO closing capacity conservatively when price is missing", () => {
  for (const [positionQty, side, upPrice] of [
    [100, OrderSide.SELL, 0.45],
    [-100, OrderSide.BUY, 0.55],
  ] as const) {
    const state = resolveBinaryCollateral({
      symbol,
      positions: [
        position({
          position_qty: positionQty,
          pending_long_qty: side === OrderSide.BUY ? 60 : 0,
          pending_short_qty: side === OrderSide.SELL ? 60 : 0,
        }),
      ],
      orders: [order({ side, price: null, reduce_only: true })],
      ordersComplete: true,
    })!;
    assert.equal(state.mode, "approximate");
    assert.equal(frozen(state, side, upPrice, 100), 33.0198);
    assert.equal(
      maxBinaryOrderQuantity({ snapshot: state, side, upPrice, balance: 0 }),
      40,
    );
  }
});

test("fallback keeps existing RO orders ahead of new orders at equal prices", () => {
  const state = resolveBinaryCollateral({
    symbol,
    positions: [position({ pending_short_qty: 60 })],
    orders: [order({ price: 0.5, reduce_only: true, created_time: NaN })],
    ordersComplete: true,
  })!;
  assert.equal(frozen(state, OrderSide.SELL, 0.5, 100), 30.018);
  assert.equal(
    maxBinaryOrderQuantity({
      snapshot: state,
      side: OrderSide.SELL,
      upPrice: 0.5,
      balance: 0,
    }),
    40,
  );
});

test("fallback preserves ordinary and RO FIFO when another order lacks timing", () => {
  for (const [positionQty, side, upPrice, otherSide, otherPrice] of [
    [100, OrderSide.SELL, 0.4, OrderSide.BUY, 0.6],
    [-100, OrderSide.BUY, 0.6, OrderSide.SELL, 0.4],
  ] as const) {
    for (const ordinaryFirst of [true, false]) {
      const rows = [
        order({
          order_id: 1,
          side,
          price: 0.5,
          quantity: 100,
          created_time: ordinaryFirst ? 100 : 200,
        }),
        order({
          order_id: 2,
          side,
          price: 0.5,
          quantity: 100,
          created_time: ordinaryFirst ? 200 : 100,
          reduce_only: true,
        }),
        order({
          order_id: 3,
          side: otherSide,
          price: otherPrice,
          quantity: 1,
          created_time: 300,
        }),
      ];
      const inputs = {
        symbol,
        positions: [
          position({
            position_qty: positionQty,
            pending_long_qty: side === OrderSide.BUY ? 200 : 1,
            pending_short_qty: side === OrderSide.SELL ? 200 : 1,
          }),
        ],
        ordersComplete: true,
      };
      const detailed = resolveBinaryCollateral({ ...inputs, orders: rows })!;
      const fallback = resolveBinaryCollateral({
        ...inputs,
        orders: [rows[0], rows[1], { ...rows[2], created_time: NaN }],
      })!;
      assert.equal(detailed.mode, "detailed");
      assert.equal(fallback.mode, "approximate");
      assert.equal(
        frozen(fallback, side, upPrice, 50),
        ordinaryFirst ? 25.015 : 0,
      );
      assert.equal(
        frozen(fallback, side, upPrice, 50),
        frozen(detailed, side, upPrice, 50),
      );
      assert.equal(
        maxBinaryOrderQuantity({
          snapshot: fallback,
          side,
          upPrice,
          balance: 1,
        }),
        ordinaryFirst ? 1.99 : 101.66,
      );
      assert.equal(
        maxBinaryOrderQuantity({
          snapshot: fallback,
          side,
          upPrice,
          balance: 1,
        }),
        maxBinaryOrderQuantity({
          snapshot: detailed,
          side,
          upPrice,
          balance: 1,
        }),
      );
      assert.equal(fallback.orders[0].createdTime, rows[0].created_time);
      assert.equal(fallback.orders[1].createdTime, rows[1].created_time);
      assert.equal(fallback.orders[2].referencePrice, otherPrice);
    }
  }
});

test("fallback decimal quantities preserve frozen rounding and affordable Max", () => {
  for (const [positionQty, side, markPrice, upPrice] of [
    [0.75, OrderSide.SELL, 0.4, 0.3],
    [-0.75, OrderSide.BUY, 0.6, 0.7],
  ] as const) {
    const state = resolveBinaryCollateral({
      symbol,
      positions: [
        position({
          position_qty: positionQty,
          pending_long_qty: side === OrderSide.BUY ? 0.8 : 0,
          pending_short_qty: side === OrderSide.SELL ? 0.8 : 0,
        }),
      ],
      orders: [
        order({ side, price: markPrice, quantity: 0.1, reduce_only: true }),
      ],
      ordersComplete: false,
      markPrice,
    })!;
    assert.equal(state.mode, "approximate");
    assert.equal(state.orders.find((item) => !item.reduceOnly)?.quantity, 0.7);
    assert.equal(frozen(state, side, upPrice, 0.02), 0.012008);
    const max = maxBinaryOrderQuantity({
      snapshot: state,
      side,
      upPrice,
      balance: 0.012007,
    });
    assert.equal(max, 0.01);
    assert.ok(frozen(state, side, upPrice, max) <= 0.012007);
  }
});

test("incomplete coverage prices only the missing remainder at Mark", () => {
  const inputs = {
    symbol,
    positions: [position({ pending_short_qty: 60 })],
    orders: [order({ quantity: 20 })],
    ordersComplete: false,
  };
  const low = resolveBinaryCollateral({ ...inputs, markPrice: 0.5 })!;
  const high = resolveBinaryCollateral({ ...inputs, markPrice: 0.9 })!;
  assert.equal(low.mode, "approximate");
  assert.equal(low.orders.length, 2);
  assert.equal(low.orders[0].quantity, 20);
  assert.equal(low.orders[0].referencePrice, 0.8);
  assert.equal(low.orders[1].quantity, 40);
  assert.equal(low.orders[1].referencePrice, 0.5);
  // 20 of the new order opens at DOWN 0.4, and all 20 known pending shares
  // are displaced into opening at DOWN 0.2.
  assert.equal(frozen(low, OrderSide.SELL, 0.6, 80), 12.0072);
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

test("known pending prices remain usable without Mark when only metadata is missing", () => {
  for (const overrides of [{ margin_mode: undefined }, { created_time: NaN }]) {
    const state = resolveBinaryCollateral({
      symbol,
      positions: [position({ pending_short_qty: 60, mark_price: NaN })],
      orders: [order(overrides)],
      ordersComplete: true,
    });
    assert.equal(state?.mode, "approximate");
    assert.equal(state?.orders[0].referencePrice, 0.8);
    assert.equal(state?.orders[0].quantity, 60);
    assert.equal(availableBinaryCloseQuantity(state, OrderSide.SELL), 40);
    assert.ok(
      maxBinaryOrderQuantity({
        snapshot: state,
        side: OrderSide.BUY,
        upPrice: 0.65,
        balance: 82.16,
      }) > 0,
    );
  }
});

test("unknown opening prices or uncovered pending quantities still require Mark", () => {
  for (const [pendingQty, price] of [
    [60, NaN],
    [80, 0.8],
  ]) {
    assert.equal(
      resolveBinaryCollateral({
        symbol,
        positions: [
          position({ pending_short_qty: pendingQty, mark_price: NaN }),
        ],
        orders: [order({ price, margin_mode: undefined })],
        ordersComplete: true,
      }),
      undefined,
    );
  }
  const reduceOnly = resolveBinaryCollateral({
    symbol,
    positions: [position({ pending_short_qty: 60, mark_price: NaN })],
    orders: [order({ price: NaN, reduce_only: true })],
    ordersComplete: true,
  });
  assert.equal(reduceOnly?.mode, "approximate");
  assert.equal(reduceOnly?.orders[0].referencePrice, 0);
  assert.equal(frozen(reduceOnly!, OrderSide.SELL, 0.6, 80), 16.0096);
});

test("OR-7534 UP capacity stays positive with a DOWN holding and SELL pending order", () => {
  for (const overrides of [
    {},
    { margin_mode: undefined },
    { created_time: NaN },
  ]) {
    const state = resolveBinaryCollateral({
      symbol,
      positions: [
        position({
          position_qty: -18.6,
          pending_short_qty: 37.93,
          mark_price: NaN,
        }),
      ],
      orders: [order({ quantity: 37.93, price: 0.71, ...overrides })],
      ordersComplete: true,
    });
    assert.ok(state);
    const quantity = maxBinaryOrderQuantity({
      snapshot: state,
      side: OrderSide.BUY,
      upPrice: 0.65,
      balance: 82.16,
      baseTick: 0.01,
      baseMax: 10000,
      splitRules: { base_tick: 0.01, base_max: 10000, min_notional: 5 },
    });
    assert.ok(quantity > 0);
    assert.ok(frozen(state, OrderSide.BUY, 0.65, quantity) <= 82.16);
    assert.ok(frozen(state, OrderSide.BUY, 0.65, quantity + 0.01) > 82.16);
  }
});

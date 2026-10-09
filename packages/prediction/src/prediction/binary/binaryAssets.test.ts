import assert from "node:assert/strict";
import test from "node:test";
import { MarginMode, OrderSide, type API } from "@orderly.network/types";
import {
  binaryAccountFunds,
  binaryLockedFunds,
  binaryPositionValue,
} from "./binaryAssets";

const symbol = "PERP_BTC5M2610091200_USDC";
const position = (override: Partial<API.Position> = {}) =>
  ({
    symbol,
    position_qty: 100,
    margin: 40,
    margin_mode: MarginMode.ISOLATED,
    pending_long_qty: 0,
    pending_short_qty: 0,
    mark_price: 0.5,
    ...override,
  }) as API.Position;
const order = (override: Partial<API.Order> = {}) =>
  ({
    symbol,
    order_id: 1,
    side: OrderSide.BUY,
    price: 0.5,
    quantity: 100,
    total_executed_quantity: 0,
    created_time: 10,
    updated_time: 10,
    margin_mode: MarginMode.ISOLATED,
    status: "NEW",
    ...override,
  }) as API.Order;
test("principal, locks, collateral and withdrawal are distinct account facts", () => {
  const funds = binaryAccountFunds({
    usdc: { holding: 100, isolated_margin: 40, isolated_order_frozen: 10 },
    freeCollateral: 90,
    maxWithdrawal: 80,
    equity: 135,
  });
  assert.equal(funds.principal, 140);
  assert.equal(funds.isolatedLocked, 50);
  assert.equal(funds.available, 90);
  assert.equal(funds.withdrawable, 80);
  assert.equal(funds.equity, 135);
  assert.equal(funds.scope, "account");
  assert.equal(
    binaryAccountFunds({ freeCollateral: 100, maxWithdrawal: 100 }).available,
    undefined,
  );
});
test("missing financial inputs never fabricate a zero balance", () => {
  const funds = binaryAccountFunds({
    usdc: { holding: 0, isolated_margin: undefined!, isolated_order_frozen: 0 },
  });
  assert.equal(funds.principal, undefined);
  assert.equal(funds.isolatedLocked, undefined);
  assert.equal(funds.crossBalance, 0);
});
test("indicative UP/DOWN values mirror actual trade and do not alter funds", () => {
  assert.deepEqual(
    binaryPositionValue(
      { quantity: 100, averagePrice: 0.4, outcome: "up" },
      0.6,
    ),
    { price: 0.6, value: 60, pnl: 20 },
  );
  assert.deepEqual(
    binaryPositionValue(
      { quantity: 100, averagePrice: 0.6, outcome: "down" },
      0.6,
    ),
    { price: 0.4, value: 40, pnl: -20 },
  );
  assert.equal(
    binaryPositionValue({ quantity: 100, averagePrice: 0.4, outcome: "up" })
      .value,
    undefined,
  );
  assert.equal(
    binaryPositionValue(
      { quantity: 100, averagePrice: 0.4, outcome: "up" },
      1.1,
    ).value,
    undefined,
  );
});
test("pending-only rounds survive without metadata and freeze 50.03", () => {
  const result = binaryLockedFunds({
    positions: [],
    orders: [order()],
    ordersComplete: true,
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].positionMargin, 0);
  assert.equal(result[0].orderFrozen, 50.03);
  assert.equal(result[0].total, 50.03);
  assert.equal(result[0].orderSource, "estimated");
  assert.equal(result[0].expectedReleaseAt, Date.UTC(2026, 9, 9, 12, 5));
});
test("reverse partial fills and RO exits reserve closes without double freezing", () => {
  const result = binaryLockedFunds({
    positions: [position({ pending_short_qty: 140 })],
    orders: [
      order({
        side: OrderSide.SELL,
        price: 0.6,
        quantity: 150,
        total_executed_quantity: 10,
      }),
    ],
    ordersComplete: true,
  });
  assert.equal(result[0].orderFrozen, 16.0096);
  assert.equal(result[0].total, 56.0096);
  const ro = binaryLockedFunds({
    positions: [position({ pending_short_qty: 100 })],
    orders: [order({ side: OrderSide.SELL, reduce_only: true })],
    ordersComplete: true,
  });
  assert.equal(ro[0].orderFrozen, 0);
  assert.equal(ro[0].total, 40);
});
test("unknown position margin or missing order coverage retains a missing result", () => {
  const a = binaryLockedFunds({
    positions: [position({ margin: undefined })],
    orders: [],
    ordersComplete: true,
  });
  assert.equal(a[0].total, undefined);
  assert.equal(a[0].marginSource, "unavailable");
  const b = binaryLockedFunds({ orders: [order()], ordersComplete: false });
  assert.equal(b[0].total, undefined);
  assert.equal(b[0].orderSource, "unavailable");
});
test("multiple rounds keep separate values and ignore PERP rows", () => {
  const result = binaryLockedFunds({
    positions: [position(), position({ symbol: "PERP_BTC_USDC" })],
    orders: [order({ symbol: "PERP_BTC10M2610091200_USDC" })],
    ordersComplete: true,
  });
  assert.equal(result.length, 2);
  assert.equal(result.find((x) => x.symbol === symbol)!.positionMargin, 40);
});

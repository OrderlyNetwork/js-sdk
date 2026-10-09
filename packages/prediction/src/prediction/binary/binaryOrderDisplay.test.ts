import assert from "node:assert/strict";
import test from "node:test";
import {
  OrderSide,
  OrderStatus,
  OrderType,
  type API,
} from "@orderly.network/types";
import {
  binaryOrderDisplayPrice,
  binaryOrderExecutedValue,
  binaryOrderEditPayload,
  toPredictionOrder,
} from "./binaryOrderDisplay";

const order = (changes: Partial<API.Order> = {}) =>
  ({
    order_id: 1,
    symbol: "PERP_BTC5M2610081200_USDC",
    side: OrderSide.BUY,
    type: OrderType.IOC,
    price: 0.55,
    quantity: 100,
    total_executed_quantity: 40,
    average_executed_price: 0.5,
    status: OrderStatus.CANCELLED,
    total_fee: 0.001234,
    fee_asset: "USDC",
    created_time: 1,
    ...changes,
  }) as API.Order;

test("partially filled cancelled orders retain actual value, average and confirmed fee", () => {
  const row = toPredictionOrder(order());
  assert.equal(row.status, "cancelled");
  assert.equal(row.filledQuantity, 40);
  assert.equal(row.quantity, 100);
  assert.equal(binaryOrderExecutedValue(row), 20);
  assert.equal(row.totalFee, 0.001234);
});

test("edits retain the original type, reduce-only flag and client metadata", () => {
  for (const type of [
    OrderType.LIMIT,
    OrderType.POST_ONLY,
    OrderType.BID,
    OrderType.ASK,
    OrderType.IOC,
  ]) {
    for (const reduceOnly of [false, true]) {
      const row = toPredictionOrder(
        order({
          type,
          side: OrderSide.SELL,
          reduce_only: reduceOnly,
          client_order_id: "mm_123",
          order_tag: "maker",
        }),
      );
      const payload = binaryOrderEditPayload(row, 0.55, 80, 0.01, 0.01)!;
      assert.deepEqual(payload, {
        order_id: 1,
        symbol: row.symbol,
        side: OrderSide.SELL,
        order_type: type,
        reduce_only: reduceOnly,
        client_order_id: "mm_123",
        order_tag: "maker",
        order_price: "0.55",
        order_quantity: "80.00",
      });
      assert.equal(row.type, type === OrderType.IOC ? "market" : "limit");
    }
  }
  const row = toPredictionOrder(order());
  assert.equal(
    binaryOrderEditPayload(
      { ...row, orderType: undefined },
      0.5,
      80,
      0.01,
      0.01,
    ),
    undefined,
  );
});

test("DOWN display complements raw UP prices without modifying request fields", () => {
  const row = toPredictionOrder(
    order({ side: OrderSide.SELL, price: 0.7, average_executed_price: 0.6 }),
  );
  assert.equal(row.price, 0.7);
  assert.equal(row.averagePrice, 0.6);
  assert.equal(binaryOrderDisplayPrice(row, row.price), 0.3);
  assert.equal(binaryOrderDisplayPrice(row, row.averagePrice!), 0.4);
  assert.equal(binaryOrderExecutedValue(row), 16);
  assert.equal(binaryOrderDisplayPrice(row, 0.3), 0.7);
});

test("zero actual fees remain zero and missing historical fees never become free", () => {
  assert.equal(toPredictionOrder(order({ total_fee: 0 })).totalFee, 0);
  for (const fee of [undefined, NaN, Infinity])
    assert.equal(
      toPredictionOrder(order({ total_fee: fee })).totalFee,
      undefined,
    );
  const noFill = toPredictionOrder(order({ total_executed_quantity: 0 }));
  assert.equal(noFill.averagePrice, undefined);
  assert.equal(binaryOrderExecutedValue(noFill), 0);
  assert.equal(
    binaryOrderExecutedValue(
      toPredictionOrder(order({ average_executed_price: NaN })),
    ),
    undefined,
  );
});

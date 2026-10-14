import assert from "node:assert/strict";
import test from "node:test";
import { i18n } from "@orderly.network/i18n";
import { OrderSide, OrderStatus, type API } from "@orderly.network/types";
import type { PredictionOpenOrder } from "../prediction.types";
import { toPredictionOrder } from "./binaryOrderDisplay";
import { binaryOrderPlainText } from "./binaryOrderPlainText";

const order: PredictionOpenOrder = {
  id: 1,
  symbol: "PERP_ETH15M2610091200_USDC",
  outcome: "down",
  side: "sell",
  type: "limit",
  price: 0.7,
  quantity: 100,
  filledQuantity: 40,
  averagePrice: 0.8,
  round: 1791547200,
  timestamp: 1791547200000,
  status: "cancelled",
};

test("CSV uses the actual market, DOWN price and executed remainder of a cancelled order", () => {
  assert.equal(
    binaryOrderPlainText(order, "side"),
    `${i18n.t("common.buy")} ${i18n.t("prediction.down")}`,
  );
  assert.equal(binaryOrderPlainText(order, "symbol"), `${order.symbol} (down)`);
  assert.equal(binaryOrderPlainText(order, "price"), "0.3");
  assert.equal(binaryOrderPlainText(order, "average_executed_price"), "0.2");
  assert.equal(binaryOrderPlainText(order, "fill_quantity"), "40 / 100");
  assert.equal(binaryOrderPlainText(order, "executed"), "8");
  assert.equal(binaryOrderPlainText(order, "notional"), "8");
});

test("CSV matches opening and closing share direction, price and executed amount", () => {
  for (const [side, reduceOnly, outcome, action, price, value] of [
    [OrderSide.BUY, false, "up", "buy", "0.7", "28"],
    [OrderSide.SELL, false, "down", "buy", "0.3", "12"],
    [OrderSide.SELL, true, "up", "sell", "0.7", "28"],
    [OrderSide.BUY, true, "down", "sell", "0.3", "12"],
  ] as const) {
    const row = toPredictionOrder({
      order_id: 1,
      symbol: order.symbol,
      side,
      reduce_only: reduceOnly,
      price: 0.7,
      average_executed_price: 0.7,
      quantity: 100,
      total_executed_quantity: 40,
      created_time: order.timestamp,
      status: OrderStatus.CANCELLED,
    } as API.Order);
    assert.equal(
      binaryOrderPlainText(row, "side"),
      `${i18n.t(`common.${action}`)} ${i18n.t(`prediction.${outcome}`)}`,
    );
    assert.equal(
      binaryOrderPlainText(row, "symbol"),
      `${order.symbol} (${outcome})`,
    );
    assert.equal(binaryOrderPlainText(row, "average_executed_price"), price);
    assert.equal(binaryOrderPlainText(row, "notional"), value);
    assert.equal(binaryOrderPlainText(row, "executed"), value);
  }
});

test("CSV exports the OR-7523 expiry close as Sell UP at 1 USDC for 13.82 USDC", () => {
  const row = toPredictionOrder({
    order_id: 9686023012,
    symbol: "PERP_BTC5M2610140110_USDC",
    type: "SETTLEMENT",
    side: OrderSide.SELL,
    reduce_only: true,
    price: 1,
    average_executed_price: 1,
    quantity: 13.82,
    total_executed_quantity: 13.82,
    created_time: order.timestamp,
    status: OrderStatus.FILLED,
  } as API.Order);
  assert.equal(
    binaryOrderPlainText(row, "side"),
    `${i18n.t("common.sell")} ${i18n.t("prediction.up")}`,
  );
  assert.equal(binaryOrderPlainText(row, "average_executed_price"), "1");
  assert.equal(binaryOrderPlainText(row, "notional"), "13.82");
});

test("CSV distinguishes unfilled, missing average price and partial pending executions", () => {
  assert.equal(
    binaryOrderPlainText({ ...order, filledQuantity: 0 }, "executed"),
    "0",
  );
  assert.equal(
    binaryOrderPlainText({ ...order, averagePrice: undefined }, "executed"),
    "--",
  );
  assert.equal(
    binaryOrderPlainText({ ...order, status: "partialFilled" }, "notional"),
    "30",
  );
  assert.equal(
    binaryOrderPlainText({ ...order, type: "market" }, "price"),
    "Market",
  );
  assert.equal(
    binaryOrderPlainText(order, "created_time"),
    new Date(order.timestamp).toISOString(),
  );
});

test("CSV keeps reduce-only distinguishable with the shared Yes/No wording", () => {
  assert.equal(
    binaryOrderPlainText({ ...order, reduceOnly: true }, "reduce_only"),
    "Yes",
  );
  assert.equal(
    binaryOrderPlainText({ ...order, reduceOnly: false }, "reduce_only"),
    "No",
  );
  // A missing attribute reads as No, matching the page cell and perp CSV rows.
  assert.equal(binaryOrderPlainText(order, "reduce_only"), "No");
});

import assert from "node:assert/strict";
import test from "node:test";
import type { PredictionOpenOrder } from "../prediction.types";
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
  assert.equal(binaryOrderPlainText(order, "symbol"), `${order.symbol} (down)`);
  assert.equal(binaryOrderPlainText(order, "price"), "0.3");
  assert.equal(binaryOrderPlainText(order, "average_executed_price"), "0.2");
  assert.equal(binaryOrderPlainText(order, "fill_quantity"), "40 / 100");
  assert.equal(binaryOrderPlainText(order, "executed"), "8");
  assert.equal(binaryOrderPlainText(order, "notional"), "8");
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

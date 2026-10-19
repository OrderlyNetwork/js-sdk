import assert from "node:assert/strict";
import test from "node:test";
import {
  OrderSide,
  OrderStatus,
  OrderType,
  type API,
} from "@orderly.network/types";
import {
  filterPredictionOrders,
  binaryOrderDisplayType,
  binaryOrderDisplayStatus,
  binaryOrderRound,
  binaryOrderOutcome,
  binaryOrderDisplayPrice,
  binaryOrderDisplaySide,
  binaryOrderExecutedValue,
  binaryOrderEditPayload,
  binaryPendingOrderPrices,
  hasPredictionExecutions,
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

test("filtering keeps original records, extra API fields and invalid values unchanged", () => {
  const records = [
    9.4227,
    148.4364,
    -260.75,
    -8,
    0,
    undefined,
    NaN,
    Infinity,
    -Infinity,
  ].map((realized_pnl, index) =>
    Object.freeze({
      ...order({ order_id: index, realized_pnl }),
      extra_api_field: "retained",
    }),
  );
  const input = Object.freeze([
    ...records,
    order({ symbol: "PERP_BTC_USDC" }),
    order({ symbol: "PERP_ETH5M2610081200_USDC" }),
    order({ algo_order_id: 123 }),
  ]);
  const filtered = filterPredictionOrders(input, "PERP_BTC_USDC");
  assert.equal(filtered.length, records.length);
  filtered.forEach((row, index) => {
    assert.strictEqual(row, records[index]);
    assert.equal((row as (typeof records)[number]).extra_api_field, "retained");
    binaryOrderOutcome(row);
    binaryOrderDisplayType(row);
    binaryOrderDisplayStatus(row);
    binaryOrderRound(row);
    binaryOrderExecutedValue(row);
    binaryOrderEditPayload(row, 0.5, 100, 0.01, 0.01);
  });
});

test("partially filled cancelled orders retain actual value, average and confirmed fee", () => {
  const row = order();
  assert.equal(row.status, OrderStatus.CANCELLED);
  assert.equal(row.total_executed_quantity, 40);
  assert.equal(row.quantity, 100);
  assert.equal(binaryOrderExecutedValue(row), 20);
  assert.equal(row.total_fee, 0.001234);
});

test("opening and closing outcomes use share direction while preserving API side", () => {
  for (const [side, reduceOnly, outcome, action, price, value] of [
    [OrderSide.BUY, false, "up", "buy", 0.7, 28],
    [OrderSide.SELL, false, "down", "buy", 0.3, 12],
    [OrderSide.SELL, true, "up", "sell", 0.7, 28],
    [OrderSide.BUY, true, "down", "sell", 0.3, 12],
    [OrderSide.BUY, undefined, "up", "buy", 0.7, 28],
    [OrderSide.SELL, undefined, "down", "buy", 0.3, 12],
  ] as const) {
    const row = order({
      side,
      reduce_only: reduceOnly,
      price: 0.7,
      average_executed_price: 0.7,
    });
    assert.equal(binaryOrderOutcome(row), outcome);
    assert.equal(row.side, side);
    assert.equal(binaryOrderDisplaySide(row), action);
    assert.equal(row.price, 0.7);
    assert.equal(row.average_executed_price, 0.7);
    assert.equal(binaryOrderDisplayPrice(row, row.price), price);
    assert.equal(binaryOrderExecutedValue(row), value);
    assert.equal(row.status, OrderStatus.CANCELLED);
  }
});

test("OR-7523: UP expiry close displays its actual 1 USDC price and 13.82 payout", () => {
  const row = order({
    order_id: 9686023012,
    symbol: "PERP_BTC5M2610140110_USDC",
    type: "SETTLEMENT",
    side: OrderSide.SELL,
    reduce_only: true,
    price: 1,
    quantity: 13.82,
    total_executed_quantity: 13.82,
    average_executed_price: 1,
    status: OrderStatus.FILLED,
  });
  assert.equal(binaryOrderOutcome(row), "up");
  assert.equal(binaryOrderDisplaySide(row), "sell");
  assert.equal(binaryOrderDisplayPrice(row, row.average_executed_price!), 1);
  assert.equal(binaryOrderExecutedValue(row), 13.82);
  assert.equal(hasPredictionExecutions(row), true);
});

test("UP and DOWN expiry closes preserve both winning and losing settlement prices", () => {
  for (const [side, upPrice, outcome, price, value] of [
    [OrderSide.SELL, 1, "up", 1, 13.82],
    [OrderSide.SELL, 0, "up", 0, 0],
    [OrderSide.BUY, 0, "down", 1, 13.82],
    [OrderSide.BUY, 1, "down", 0, 0],
  ] as const) {
    const row = order({
      side,
      reduce_only: true,
      price: upPrice,
      average_executed_price: upPrice,
      quantity: 13.82,
      total_executed_quantity: 13.82,
      status: OrderStatus.FILLED,
    });
    assert.equal(binaryOrderOutcome(row), outcome);
    assert.equal(
      binaryOrderDisplayPrice(row, row.average_executed_price!),
      price,
    );
    assert.equal(binaryOrderExecutedValue(row), value);
  }
});

test("closing orders do not invent prices for missing averages or empty executions", () => {
  for (const side of [OrderSide.BUY, OrderSide.SELL]) {
    const missing = order({
      side,
      reduce_only: true,
      average_executed_price: undefined,
    });
    assert.equal(missing.average_executed_price, undefined);
    assert.equal(binaryOrderExecutedValue(missing), undefined);
    const empty = order({
      side,
      reduce_only: true,
      total_executed_quantity: 0,
    });
    assert.equal(empty.average_executed_price, 0.5);
    assert.equal(binaryOrderExecutedValue(empty), 0);
  }
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
      const row = order({
        type,
        side: OrderSide.SELL,
        reduce_only: reduceOnly,
        client_order_id: "mm_123",
        order_tag: "maker",
      });
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
      assert.equal(row.type, type);
      assert.equal(
        binaryOrderDisplayType(row),
        type === OrderType.IOC ? "market" : "limit",
      );
    }
  }
  const row = order();
  assert.equal(
    binaryOrderEditPayload({ ...row, type: undefined }, 0.5, 80, 0.01, 0.01),
    undefined,
  );
});

test("edits omit absent or empty client order IDs", () => {
  for (const clientOrderId of [undefined, null, ""]) {
    // REST can return null even though the API type only declares a string.
    const row = {
      ...order({ price: 0.53, quantity: 11.77 }),
      client_order_id: clientOrderId,
    } as API.Order;
    const payload = binaryOrderEditPayload(row, 0.51, 11.77, 0.01, 0.01)!;
    assert.equal(Object.hasOwn(payload, "client_order_id"), false);
    assert.equal(payload.order_id, row.order_id);
  }
});

test("edits omit absent or empty order tags", () => {
  for (const orderTag of [undefined, ""]) {
    const row = order({ order_tag: orderTag });
    const payload = binaryOrderEditPayload(row, 0.55, 80, 0.01, 0.01)!;
    assert.equal(Object.hasOwn(payload, "order_tag"), false);
  }
});

test("edits preserve explicit reduce-only booleans and omit an absent flag", () => {
  for (const reduceOnly of [false, true]) {
    const row = order({ reduce_only: reduceOnly });
    const payload = binaryOrderEditPayload(row, 0.55, 80, 0.01, 0.01)!;
    assert.equal(payload.reduce_only, reduceOnly);
  }
  const row = order({ reduce_only: undefined });
  const payload = binaryOrderEditPayload(row, 0.55, 80, 0.01, 0.01)!;
  assert.equal(Object.hasOwn(payload, "reduce_only"), false);
});

test("edits require a nonempty symbol and original order type", () => {
  const row = order();
  for (const changes of [{ symbol: "" }, { type: "" }]) {
    assert.equal(
      binaryOrderEditPayload({ ...row, ...changes }, 0.55, 80, 0.01, 0.01),
      undefined,
    );
  }
});

test("DOWN display complements raw UP prices without modifying request fields", () => {
  const row = order({
    side: OrderSide.SELL,
    price: 0.7,
    average_executed_price: 0.6,
  });
  assert.equal(row.price, 0.7);
  assert.equal(row.average_executed_price, 0.6);
  assert.equal(binaryOrderDisplayPrice(row, row.price), 0.3);
  assert.equal(binaryOrderDisplayPrice(row, row.average_executed_price!), 0.4);
  assert.equal(binaryOrderExecutedValue(row), 16);
  assert.equal(binaryOrderDisplayPrice(row, 0.3), 0.7);
});

test("missing averages stay unavailable and empty executions keep zero value", () => {
  assert.equal(
    binaryOrderExecutedValue(order({ total_executed_quantity: 0 })),
    0,
  );
  for (const average_executed_price of [undefined, NaN, Infinity, -Infinity]) {
    assert.equal(
      binaryOrderExecutedValue(order({ average_executed_price })),
      undefined,
    );
  }
});

test("filled means has executions: terminal with fills, never working or empty", () => {
  // Partially filled IOC whose remainder cancelled: the manual-QA case.
  assert.equal(hasPredictionExecutions(order()), true);
  assert.equal(
    hasPredictionExecutions(order({ status: OrderStatus.FILLED })),
    true,
  );
  // Working orders never count, even with partial fills on the book.
  assert.equal(
    hasPredictionExecutions(order({ status: OrderStatus.PARTIAL_FILLED })),
    false,
  );
  assert.equal(
    hasPredictionExecutions(order({ status: OrderStatus.NEW })),
    false,
  );
  // Terminal without executions never counts.
  assert.equal(
    hasPredictionExecutions(
      order({ status: OrderStatus.CANCELLED, total_executed_quantity: 0 }),
    ),
    false,
  );
  assert.equal(
    hasPredictionExecutions(
      order({ status: OrderStatus.REJECTED, total_executed_quantity: 0 }),
    ),
    false,
  );
});

test("account and paginated order projections preserve terminal states and product scope", async () => {
  const {
    filterPredictionOrders,
    isPredictionTerminalOrder,
    toPredictionStatus,
    toOrderStatus,
  } = await import("./binaryOrderDisplay");
  assert.equal(toPredictionStatus(OrderStatus.NEW), "pending");
  assert.equal(toPredictionStatus(OrderStatus.REJECTED), "rejected");
  assert.equal(toOrderStatus("partialFilled"), OrderStatus.PARTIAL_FILLED);
  const rows = filterPredictionOrders(
    [
      order({ status: OrderStatus.REJECTED }),
      order({ order_id: 2, status: OrderStatus.PARTIAL_FILLED }),
      order({ order_id: 3, status: OrderStatus.CANCELLED }),
      order({ order_id: 4, symbol: "PERP_BTC_USDC" }),
      order({ order_id: 5, symbol: "PERP_ETH5M2610081200_USDC" }),
    ],
    "PERP_BTC_USDC",
  );
  assert.deepEqual(
    rows.map((row) => row.status),
    [OrderStatus.REJECTED, OrderStatus.PARTIAL_FILLED, OrderStatus.CANCELLED],
  );
  assert.deepEqual(
    rows.filter(isPredictionTerminalOrder).map((row) => row.status),
    [OrderStatus.REJECTED, OrderStatus.CANCELLED],
  );
  assert.equal(rows[1].total_executed_quantity, 40);
});

test("pending order prices follow the selected round and outcome book", () => {
  const symbol = "PERP_BTC5M2610081200_USDC";
  const rows = [
    order({ status: OrderStatus.NEW, price: 0.37 }),
    order({
      order_id: 2,
      side: OrderSide.SELL,
      status: OrderStatus.PARTIAL_FILLED,
      price: 0.62,
    }),
    order({ order_id: 3, status: OrderStatus.CANCELLED, price: 0.4 }),
    order({ order_id: 4, status: OrderStatus.FILLED, price: 0.41 }),
    order({
      order_id: 5,
      symbol: "PERP_BTC5M2610081205_USDC",
      status: OrderStatus.NEW,
      price: 0.5,
    }),
    order({ order_id: 6, status: OrderStatus.NEW, price: undefined }),
  ];

  assert.deepEqual(binaryPendingOrderPrices(rows, symbol, "up"), [0.37, 0.62]);
  assert.deepEqual(
    binaryPendingOrderPrices(rows, symbol, "down"),
    [0.63, 0.38],
  );
  assert.deepEqual(binaryPendingOrderPrices(rows, undefined, "up"), []);
});

import { API, OrderStatus, WSMessage } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { RegularOrderMergeHandler } from "../regularOrderMergeHandler";

describe("Regular order creation priority", () => {
  it.each(["REPLACED", "FILLED", "PARTIAL_FILLED"])(
    "preserves creation time on %s updates lacking createdTime",
    (status) => {
      const previous = [
        {
          meta: { total: 1 },
          rows: [
            {
              order_id: 1,
              created_time: 100,
              quantity: 100,
              total_executed_quantity: 0,
            },
          ],
        },
      ] as API.OrderResponse[];
      const message = {
        orderId: 1,
        status,
        timestamp: 200,
        quantity: 100,
        totalExecutedQuantity: 20,
      } as WSMessage.Order;
      const handler = new RegularOrderMergeHandler(message);
      // The base formatter has already synthesized a creation time.
      expect(handler.data.created_time).toBe(200);
      const updated = handler.merge("orders:INCOMPLETE", message, previous);
      expect(updated[0].rows[0]).toMatchObject({
        created_time: 100,
        timestamp: 200,
        total_executed_quantity: 20,
      });
      expect(previous[0].rows[0].total_executed_quantity).toBe(0);
    },
  );

  it("uses the event timestamp for newly inserted orders", () => {
    const message = {
      orderId: 1,
      status: "NEW",
      timestamp: 200,
    } as WSMessage.Order;
    const handler = new RegularOrderMergeHandler(message);
    const updated = handler.merge("orders:INCOMPLETE", message, [
      { meta: { total: 0 }, rows: [] },
    ] as API.OrderResponse[]);
    expect(updated[0].rows[0].created_time).toBe(200);
  });

  it("treats a zero creation time as missing, matching the base formatter", () => {
    const message = {
      orderId: 1,
      status: "REPLACED",
      timestamp: 200,
      createdTime: 0,
    } as unknown as WSMessage.Order;
    const handler = new RegularOrderMergeHandler(message);
    const updated = handler.merge("orders:INCOMPLETE", message, [
      { meta: { total: 1 }, rows: [{ order_id: 1, created_time: 100 }] },
    ] as API.OrderResponse[]);
    expect(updated[0].rows[0].created_time).toBe(100);
  });

  it("keeps an authoritative creation time explicitly present in the update", () => {
    const message = {
      orderId: 1,
      status: "REPLACED",
      timestamp: 300,
      createdTime: 150,
    } as unknown as WSMessage.Order;
    const handler = new RegularOrderMergeHandler(message);
    const updated = handler.merge("orders:INCOMPLETE", message, [
      { meta: { total: 1 }, rows: [{ order_id: 1, created_time: 100 }] },
    ] as API.OrderResponse[]);
    expect(updated[0].rows[0].created_time).toBe(150);
  });
});

describe("Regular order partial-fill lifecycle", () => {
  const symbol = "PERP_BTC5M2610130125_USDC";
  const report = (overrides: Partial<WSMessage.Order> = {}) =>
    ({
      orderId: 1,
      symbol,
      side: "SELL",
      type: "LIMIT",
      status: OrderStatus.PARTIAL_FILLED,
      quantity: 43.54,
      totalExecutedQuantity: 14,
      timestamp: 200,
      ...overrides,
    }) as WSMessage.Order;
  const empty = () => [{ meta: { total: 0 }, rows: [] }] as API.OrderResponse[];
  const existing = () =>
    [
      {
        meta: { total: 1 },
        rows: [
          {
            order_id: 1,
            status: OrderStatus.NEW,
            quantity: 43.54,
            total_executed_quantity: 0,
            created_time: 100,
          },
        ],
      },
    ] as API.OrderResponse[];
  const merge = (key: string, cache: API.OrderResponse[], message = report()) =>
    new RegularOrderMergeHandler(message).merge(key, message, cache);

  it.each([
    "orders",
    "orders:50:BINARY",
    `orders:${symbol}:SELL:50:BINARY`,
    "orders:INCOMPLETE",
    `orders:INCOMPLETE:${symbol}:SELL:50:BINARY`,
    "orders:PARTIAL_FILLED",
    `orders:PARTIAL_FILLED:${symbol}:SELL:50:BINARY`,
    "orders:OPEN",
    `orders:OPEN:${symbol}:SELL:50:BINARY`,
    "orders:INCOMPLETE:PERP_BTC_USDC:BUY:50:PERP",
  ])("inserts and updates partial fills in %s", (key) => {
    const message = report(
      key.endsWith(":PERP") ? { symbol: "PERP_BTC_USDC", side: "BUY" } : {},
    );
    const cache = empty();
    const inserted = merge(key, cache, message);
    expect(inserted[0].meta.total).toBe(1);
    expect(inserted[0].rows).toHaveLength(1);
    expect(inserted[0].rows[0]).toMatchObject({
      symbol: message.symbol,
      status: OrderStatus.PARTIAL_FILLED,
      quantity: 43.54,
      total_executed_quantity: 14,
    });
    expect(merge(key, existing(), message)[0].rows[0]).toMatchObject({
      status: OrderStatus.PARTIAL_FILLED,
      total_executed_quantity: 14,
      created_time: 100,
    });
    expect(cache).toEqual(empty());
    expect(merge(key, inserted, message)).toEqual(inserted);
  });

  it("keeps the creation time and count when an inserted order receives another report", () => {
    const key = "orders:INCOMPLETE:50:BINARY";
    const inserted = merge(key, empty());
    const updated = merge(key, inserted, report({ timestamp: 300 }));
    expect(updated[0].meta.total).toBe(1);
    expect(updated[0].rows).toHaveLength(1);
    expect(updated[0].rows[0]).toMatchObject({
      created_time: 200,
      timestamp: 300,
      total_executed_quantity: 14,
    });
    expect(inserted[0].rows[0].timestamp).toBe(200);
  });

  it("does not duplicate rows or counts for repeated cumulative-fill reports", () => {
    const key = "orders:INCOMPLETE:50:BINARY";
    const first = merge(key, existing());
    const message = report({ totalExecutedQuantity: 28.47 });
    const second = merge(key, first, message);
    const repeated = merge(key, second, message);
    expect(repeated).toEqual(second);
    expect(repeated[0].meta.total).toBe(1);
    expect(repeated[0].rows).toHaveLength(1);
    expect(first[0].rows[0].total_executed_quantity).toBe(14);
  });

  it("updates cumulative fills on the original page without mutating the cache", () => {
    const cache = [
      { meta: { total: 2 }, rows: [{ order_id: 2 }] },
      { ...existing()[0], meta: { total: 2 } },
    ] as API.OrderResponse[];
    const snapshot = JSON.parse(JSON.stringify(cache));
    const first = merge("orders:INCOMPLETE:50:BINARY", cache);
    const second = merge(
      "orders:INCOMPLETE:50:BINARY",
      first,
      report({ totalExecutedQuantity: 28.47, timestamp: 300 }),
    );
    expect(first[0]).toEqual(cache[0]);
    expect(second[1].rows).toHaveLength(1);
    expect(second[1].rows[0]).toMatchObject({
      quantity: 43.54,
      total_executed_quantity: 28.47,
      created_time: 100,
    });
    expect(
      new Decimal(first[1].rows[0].quantity)
        .sub(first[1].rows[0].total_executed_quantity)
        .toNumber(),
    ).toBe(29.54);
    expect(
      new Decimal(second[1].rows[0].quantity)
        .sub(second[1].rows[0].total_executed_quantity)
        .toNumber(),
    ).toBe(15.07);
    expect(second.map((page) => page.meta.total)).toEqual([2, 2]);
    expect(cache).toEqual(snapshot);
  });

  it.each([0, 150])(
    "preserves creation-time priority for createdTime=%s",
    (createdTime) => {
      const message = { ...report(), createdTime } as WSMessage.Order;
      expect(
        merge("orders:INCOMPLETE", existing(), message)[0].rows[0].created_time,
      ).toBe(createdTime || 100);
    },
  );

  it.each(["orders:NEW", `orders:NEW:${symbol}:SELL:50:BINARY`])(
    "removes a partial fill from %s",
    (key) => {
      const cache = existing();
      expect(merge(key, cache)).toEqual(empty());
      expect(merge(key, empty())).toEqual(empty());
      expect(cache).toEqual(existing());
    },
  );

  it.each([
    OrderStatus.FILLED,
    OrderStatus.CANCELLED,
    OrderStatus.REJECTED,
    OrderStatus.COMPLETED,
    OrderStatus.REPLACED,
  ])("ignores partial fills in %s-only lists", (status) => {
    for (const key of [
      `orders:${status}`,
      `orders:${status}:${symbol}:SELL:50:BINARY`,
    ]) {
      for (const cache of [empty(), existing()])
        expect(merge(key, cache)).toBe(cache);
    }
  });

  it.each([
    "orders:50:BINARY",
    `orders:${symbol}:SELL:50:BINARY`,
    "orders:50:PERP",
  ])("retains full fills in the unfiltered list %s", (key) => {
    const message = report(
      key.endsWith(":PERP") ? { symbol: "PERP_BTC_USDC" } : {},
    );
    const partial = merge(key, empty(), message);
    const full = {
      ...message,
      status: OrderStatus.FILLED,
      totalExecutedQuantity: 43.54,
      timestamp: 300,
    };
    const completed = merge(key, partial, full);
    expect(completed[0].rows).toHaveLength(1);
    expect(completed[0].rows[0]).toMatchObject({
      status: OrderStatus.FILLED,
      total_executed_quantity: 43.54,
      quantity: 43.54,
      created_time: 200,
      updated_time: 300,
    });
    expect(completed[0].meta.total).toBe(1);
    expect(merge(key, completed, full)).toEqual(completed);
    expect(merge(key, empty(), full)[0].rows).toHaveLength(1);
    expect(partial[0].rows[0].status).toBe(OrderStatus.PARTIAL_FILLED);
  });

  it.each([
    "orders:FILLED",
    "orders:FILLED:BUY:50:PERP",
    `orders:FILLED:${symbol}:BUY:50:BINARY`,
  ])(
    "updates filled records without removing or duplicating them in %s",
    (key) => {
      const full = report({
        symbol: key.endsWith(":PERP") ? "PERP_BTC_USDC" : symbol,
        side: "BUY" as WSMessage.Order["side"],
        status: OrderStatus.FILLED,
        totalExecutedQuantity: 43.54,
        timestamp: 300,
      });
      const initial = merge(key, empty(), full);
      const snapshot = JSON.parse(JSON.stringify(initial));
      const updatedReport = { ...full, timestamp: 400, executedPrice: 123 };
      const updated = merge(key, initial, updatedReport);

      expect(updated[0].rows).toHaveLength(1);
      expect(updated[0].rows[0]).toMatchObject({
        order_id: 1,
        status: OrderStatus.FILLED,
        total_executed_quantity: 43.54,
        executed_price: 123,
        created_time: 300,
        updated_time: 400,
      });
      expect(updated[0].meta.total).toBe(1);
      expect(merge(key, updated, updatedReport)).toEqual(updated);
      expect(initial).toEqual(snapshot);
    },
  );

  it("updates a filled record on the second page without changing either page's count", () => {
    const key = "orders:FILLED:BUY:50:PERP";
    const full = report({
      symbol: "PERP_BTC_USDC",
      status: OrderStatus.FILLED,
      totalExecutedQuantity: 43.54,
    });
    const previous = [
      {
        meta: { total: 2 },
        rows: [
          { ...existing()[0].rows[0], order_id: 2, status: OrderStatus.FILLED },
        ],
      },
      { ...merge(key, empty(), full)[0], meta: { total: 2 } },
    ] as API.OrderResponse[];
    const snapshot = JSON.parse(JSON.stringify(previous));
    const updated = merge(key, previous, { ...full, timestamp: 400 });

    expect(updated.map((page) => page.meta.total)).toEqual([2, 2]);
    expect(updated.map((page) => page.rows.length)).toEqual([1, 1]);
    expect(updated[0]).toEqual(previous[0]);
    expect(updated[1].rows[0]).toMatchObject({
      order_id: 1,
      updated_time: 400,
    });
    expect(previous).toEqual(snapshot);
  });

  it.each(["orders:NEW:BUY:50:PERP", "orders:INCOMPLETE:BUY:50:PERP"])(
    "removes a fully filled order from the pending list %s",
    (key) => {
      const full = report({
        status: OrderStatus.FILLED,
        totalExecutedQuantity: 43.54,
      });
      expect(merge(key, existing(), full)).toEqual(empty());
    },
  );

  it.each([OrderStatus.FILLED, OrderStatus.CANCELLED, OrderStatus.REJECTED])(
    "removes %s orders from the partial-only list",
    (status) => {
      for (const key of [
        "orders:PARTIAL_FILLED",
        `orders:PARTIAL_FILLED:${symbol}:SELL:50:BINARY`,
      ]) {
        const partial = merge(key, empty());
        const terminal = report({
          status,
          totalExecutedQuantity: status === OrderStatus.FILLED ? 43.54 : 14,
        });
        const removed = merge(key, partial, terminal);
        expect(removed).toEqual(empty());
        expect(merge(key, removed, terminal)).toEqual(empty());
        expect(partial[0].rows).toHaveLength(1);
      }
    },
  );

  it("retains a legacy FILLED report with an unfilled remainder in the partial-only list", () => {
    const key = "orders:PARTIAL_FILLED:50:BINARY";
    const partial = merge(key, empty());
    const updated = merge(
      key,
      partial,
      report({ status: OrderStatus.FILLED, totalExecutedQuantity: 28.47 }),
    );
    expect(updated[0].rows).toHaveLength(1);
    expect(updated[0].rows[0].total_executed_quantity).toBe(28.47);
  });

  it.each([OrderStatus.FILLED, OrderStatus.CANCELLED])(
    "keeps Pending and terminal-list behavior for %s",
    (status) => {
      const partial = merge("orders:INCOMPLETE:50:BINARY", empty());
      const terminal = report({
        status,
        totalExecutedQuantity: status === OrderStatus.FILLED ? 43.54 : 14,
      });
      expect(merge("orders:INCOMPLETE:50:BINARY", partial, terminal)).toEqual(
        empty(),
      );
      expect(
        merge(`orders:${status}:50:BINARY`, empty(), terminal)[0].rows[0]
          .status,
      ).toBe(status);
    },
  );
});

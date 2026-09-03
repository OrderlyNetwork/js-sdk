import { MarginMode, OrderSide, OrderType } from "@orderly.network/types";
import {
  DEFAULT_USDC_BORROW_LIMIT,
  aggregateOrderQuantityAndNotional,
  assertUSDCBorrowWithinLimit,
  calculateProjectedUSDCBorrow,
  getOrderQuantityAndNotional,
  normalizeUSDCBorrowLimit,
  USDCBorrowLimitExceededError,
} from "../usdcBorrowLimit";

const baseInputs = {
  marginMode: MarginMode.ISOLATED,
  reduceOnly: false,
  orderSide: OrderSide.BUY,
  orderQuantity: 1,
  orderNotional: 1000,
  leverage: 10,
  markPrice: 1000,
  positionQty: 0,
  pendingLongQty: 0,
  pendingShortQty: 0,
  usdcHolding: -49_899.4,
  usdcPendingShort: 0,
  usdcIsolatedOrderFrozen: 0,
  totalUnsettledPnL: 0,
};

describe("USDC borrow limit", () => {
  describe("normalizeUSDCBorrowLimit", () => {
    it.each([
      [50_000, 50_000],
      [-50_000, 50_000],
      [0, 0],
      [undefined, DEFAULT_USDC_BORROW_LIMIT],
      [null, DEFAULT_USDC_BORROW_LIMIT],
      [Number.NaN, DEFAULT_USDC_BORROW_LIMIT],
      [Number.POSITIVE_INFINITY, DEFAULT_USDC_BORROW_LIMIT],
    ])("normalizes %p to %p", (value, expected) => {
      expect(normalizeUSDCBorrowLimit(value)).toBe(expected);
    });
  });

  it("allows a projected borrow equal to the limit", () => {
    const projectedBorrow = calculateProjectedUSDCBorrow(baseInputs);

    expect(projectedBorrow).toBeCloseTo(50_000, 8);
    expect(() =>
      assertUSDCBorrowWithinLimit(projectedBorrow, 50_000),
    ).not.toThrow();
  });

  it("rejects a projected borrow above the limit", () => {
    const projectedBorrow = calculateProjectedUSDCBorrow({
      ...baseInputs,
      usdcHolding: -49_899.41,
    });

    expect(() => assertUSDCBorrowWithinLimit(projectedBorrow, 50_000)).toThrow(
      USDCBorrowLimitExceededError,
    );
  });

  it("includes pending USDC, unsettled PnL, and existing isolated frozen", () => {
    const projectedBorrow = calculateProjectedUSDCBorrow({
      ...baseInputs,
      usdcHolding: -47_000,
      usdcPendingShort: -500,
      totalUnsettledPnL: -400,
      usdcIsolatedOrderFrozen: 2_000,
    });

    expect(projectedBorrow).toBeCloseTo(50_000.6, 8);
  });

  it("does not add borrow for cross, reduce-only, or pure closing orders", () => {
    expect(
      calculateProjectedUSDCBorrow({
        ...baseInputs,
        marginMode: MarginMode.CROSS,
      }),
    ).toBe(0);
    expect(
      calculateProjectedUSDCBorrow({ ...baseInputs, reduceOnly: true }),
    ).toBe(0);
    expect(
      calculateProjectedUSDCBorrow({
        ...baseInputs,
        orderSide: OrderSide.SELL,
        positionQty: 2,
        orderQuantity: 1,
      }),
    ).toBe(0);
  });

  it("counts a reverse order after its remaining close quantity", () => {
    const projectedBorrow = calculateProjectedUSDCBorrow({
      ...baseInputs,
      orderSide: OrderSide.SELL,
      positionQty: 1,
      orderQuantity: 1.5,
      orderNotional: 150,
      markPrice: 100,
      usdcHolding: -49_990,
    });

    expect(projectedBorrow).toBeCloseTo(50_005.09, 8);
  });

  it("accounts for existing same-side close orders in a reversal", () => {
    const projectedBorrow = calculateProjectedUSDCBorrow({
      ...baseInputs,
      orderSide: OrderSide.SELL,
      positionQty: 1,
      pendingShortQty: 0.75,
      orderQuantity: 0.3,
      orderNotional: 30,
      markPrice: 100,
      usdcHolding: -49_999,
    });

    expect(projectedBorrow).toBeCloseTo(50_002.018, 8);
  });

  it("aggregates scaled child order quantity and notional", () => {
    expect(
      aggregateOrderQuantityAndNotional([
        { quantity: 1, referencePrice: 90 },
        { quantity: 2, referencePrice: 100 },
        { quantity: 1, referencePrice: 110 },
      ]),
    ).toEqual({ orderQuantity: 4, orderNotional: 400 });
  });

  it.each([
    {
      name: "limit",
      formattedOrder: {
        order_type: OrderType.LIMIT,
        order_quantity: "2",
        order_price: "90",
      },
      generatedOrder: {
        order_type: OrderType.LIMIT,
        order_quantity: "2",
        order_price: "90",
      },
      expectedType: OrderType.LIMIT,
      expectedQuantity: "2",
      referencePrice: 90,
      expected: { orderQuantity: 2, orderNotional: 180 },
    },
    {
      name: "market",
      formattedOrder: {
        order_type: OrderType.MARKET,
        order_quantity: "3",
      },
      generatedOrder: {
        order_type: OrderType.MARKET,
        order_quantity: "3",
      },
      expectedType: OrderType.MARKET,
      expectedQuantity: "3",
      referencePrice: 100,
      expected: { orderQuantity: 3, orderNotional: 300 },
    },
    {
      name: "stop market payload",
      formattedOrder: {
        order_type: OrderType.STOP_MARKET,
        order_quantity: "4",
        trigger_price: "105",
      },
      generatedOrder: {
        type: OrderType.MARKET,
        quantity: "4",
        trigger_price: "105",
      },
      expectedType: OrderType.STOP_MARKET,
      expectedQuantity: "4",
      referencePrice: 105,
      expected: { orderQuantity: 4, orderNotional: 420 },
    },
    {
      name: "BBO payload",
      formattedOrder: {
        order_type: OrderType.LIMIT,
        order_type_ext: OrderType.BID,
        order_quantity: "5",
      },
      generatedOrder: {
        order_type: OrderType.BID,
        order_quantity: "5",
      },
      expectedType: OrderType.LIMIT,
      expectedQuantity: "5",
      referencePrice: 99,
      expected: { orderQuantity: 5, orderNotional: 495 },
    },
  ])(
    "normalizes $name before calculating notional",
    ({
      formattedOrder,
      generatedOrder,
      expectedType,
      expectedQuantity,
      referencePrice,
      expected,
    }) => {
      const getReferencePrice = jest.fn(() => referencePrice);

      expect(
        getOrderQuantityAndNotional({
          formattedOrder,
          generatedOrder,
          marginMode: MarginMode.ISOLATED,
          getReferencePrice,
        }),
      ).toEqual(expected);
      expect(getReferencePrice).toHaveBeenCalledWith(
        expect.objectContaining({
          order_type: expectedType,
          order_quantity: expectedQuantity,
          margin_mode: MarginMode.ISOLATED,
        }),
      );
    },
  );

  it("uses generated scaled child quantities and notionals", () => {
    expect(
      getOrderQuantityAndNotional({
        formattedOrder: { order_type: OrderType.SCALED },
        generatedOrder: {
          order_type: OrderType.SCALED,
          orders: [
            { order_quantity: "1", order_price: "90" },
            { order_quantity: "2", order_price: "110" },
          ],
        },
        marginMode: MarginMode.ISOLATED,
        getReferencePrice: (order) => Number(order.order_price),
      }),
    ).toEqual({ orderQuantity: 3, orderNotional: 310 });
  });

  it("does not project from non-finite pending quantities", () => {
    expect(
      calculateProjectedUSDCBorrow({
        ...baseInputs,
        pendingLongQty: Number.NaN,
      }),
    ).toBeNull();
  });
});

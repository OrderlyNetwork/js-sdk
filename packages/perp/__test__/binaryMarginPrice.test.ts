import { describe, expect, it } from "@jest/globals";
import { OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import {
  additionalIsolatedOrderFrozenByOrders,
  isolatedPendingOrdersFrozen,
  IsolatedPendingOrder,
} from "../src/account";

const binaryMarginPrice = (order: IsolatedPendingOrder) =>
  order.side === OrderSide.BUY
    ? order.referencePrice
    : new Decimal(1).sub(order.referencePrice).toNumber();

describe("Product-specific isolated margin price", () => {
  it("retains the default PERP formula when the callback is omitted", () => {
    const inputs = {
      positionQty: 0,
      leverage: 1,
      orders: [{ side: OrderSide.SELL, referencePrice: 0.6, quantity: 100 }],
    };
    expect(isolatedPendingOrdersFrozen(inputs).toNumber()).toBe(60.036);
    expect(
      isolatedPendingOrdersFrozen({
        ...inputs,
        getMarginPrice: binaryMarginPrice,
      }).toNumber(),
    ).toBe(40.024);
  });

  it("keeps UP price priority when SELL margin price is inverted", () => {
    const inputs = {
      positionQty: 100,
      leverage: 1,
      pendingOrders: [
        { side: OrderSide.SELL, referencePrice: 0.8, quantity: 60 },
      ],
      newOrders: [{ side: OrderSide.SELL, referencePrice: 0.6, quantity: 80 }],
    };
    expect(
      additionalIsolatedOrderFrozenByOrders({
        ...inputs,
        getMarginPrice: binaryMarginPrice,
      }).toNumber(),
    ).toBe(8.0048);
    expect(additionalIsolatedOrderFrozenByOrders(inputs).toNumber()).toBe(
      32.0192,
    );
  });

  it("keeps creation-time tie priority and rounds each opening order separately", () => {
    const orders = [
      {
        side: OrderSide.SELL,
        referencePrice: 0.5,
        quantity: 0.010001,
        createdTime: 20,
      },
      {
        side: OrderSide.SELL,
        referencePrice: 0.5,
        quantity: 0.01,
        createdTime: 10,
      },
    ];
    expect(
      isolatedPendingOrdersFrozen({
        positionQty: 0.01,
        leverage: 1,
        orders,
        getMarginPrice: binaryMarginPrice,
      }).toNumber(),
    ).toBe(0.005004);
  });
});

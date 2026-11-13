import { describe, expect, it, vi } from "vitest";
import {
  AlgoOrderRootType,
  AlgoOrderType,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import type { API } from "@orderly.network/types";
import { calcBracketRoiAndPnL } from "./util";

vi.mock("@orderly.network/hooks", async () => {
  const { priceToPnl } =
    await import("@orderly.network/hooks/src/orderly/useTakeProfitAndStopLoss/tp_slUtils");
  return { utils: { priceToPnl } };
});

describe("Pending Bracket PnL", () => {
  const makeOrder = () =>
    ({
      algo_type: AlgoOrderRootType.BRACKET,
      type: OrderType.LIMIT,
      price: 90.12,
      quantity: 7.62,
      side: OrderSide.BUY,
      child_orders: [
        {
          algo_type: AlgoOrderRootType.TP_SL,
          is_activated: false,
          child_orders: [
            {
              algo_type: AlgoOrderType.TAKE_PROFIT,
              type: OrderType.LIMIT,
              trigger_price: 99.132,
              price: 99.132,
              is_activated: false,
            },
            {
              algo_type: AlgoOrderType.STOP_LOSS,
              type: OrderType.LIMIT,
              trigger_price: 83,
              price: 82.5,
              is_activated: false,
            },
          ],
        },
      ],
    }) as API.AlgoOrderExt;

  it("uses Limit order prices and floors the results to two decimals", () => {
    expect(calcBracketRoiAndPnL(makeOrder(), 3).pnl).toEqual({
      tpPnL: 68.67,
      slPnL: -58.07,
    });
  });

  it("floors a high-precision estimate just below a cent boundary", () => {
    const order = { ...makeOrder(), price: 1, quantity: 199.999999 };
    const tp = order.child_orders[0].child_orders[0];
    tp.trigger_price = 3.00000001;
    tp.price = 3.00000001;
    expect(calcBracketRoiAndPnL(order, 8).pnl.tpPnL).toBe(399.99);
  });

  it("uses the trigger price for a Market child even with a stale order price", () => {
    const order = makeOrder();
    order.child_orders[0].child_orders[1].type = OrderType.MARKET;
    expect(calcBracketRoiAndPnL(order, 3).pnl).toEqual({
      tpPnL: 68.67,
      slPnL: -54.26,
    });
  });

  it("omits the Limit estimate when the child has no order price", () => {
    const order = makeOrder();
    delete order.child_orders[0].child_orders[1].price;
    expect(calcBracketRoiAndPnL(order, 3).pnl).toEqual({
      tpPnL: 68.67,
      slPnL: undefined,
    });
  });
});

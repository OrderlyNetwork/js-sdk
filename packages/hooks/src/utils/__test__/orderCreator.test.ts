import { OrderSide } from "@orderly.network/types";
import { LimitOrderCreator, MarketOrderCreator } from "../createOrder";
import { OrderType } from "@orderly.network/types";

describe("orderCreator", () => {
  test("create market order", () => {
    const creator = new MarketOrderCreator();

    const order = creator.create({
      symbol: "BTC_USDT",
      side: OrderSide.BUY,
      order_quantity: 100,
      order_price: 1221,
      order_type: OrderType.MARKET,
    });

    expect(order).toEqual({
      symbol: "BTC_USDT",
      side: "BUY",
      order_type: "MARKET",
    });
  });

  test("create limit order", () => {
    const creator = new LimitOrderCreator();

    const order = creator.create(
      {
        symbol: "BTC_USDT",
        side: OrderSide.BUY,
        order_quantity: 100,
        order_price: 1221,
        order_type: OrderType.LIMIT,
      },
      {
        symbol: {
          base_dp: 2,
          quote_dp: 2,
        },
        markPrice: 1221,
        positionQty: 100,
      }
    );

    expect(order).toEqual({
      symbol: "BTC_USDT",
      side: "BUY",
      order_type: "LIMIT",
      order_price: 1221,
      order_quantity: 100,
    });
  });

  test("create limit order from stop order data", () => {});
});

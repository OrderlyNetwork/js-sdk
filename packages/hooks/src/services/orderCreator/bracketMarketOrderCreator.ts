import { OrderlyOrder, OrderType } from "@orderly.network/types";
import { MarketOrderCreator } from "./marketOrderCreator";
import { ValuesDepConfig, OrderValidationResult } from "./interface";
import { bracketOrderValidator } from "./baseBracketOrderCreator";

export class BracketMarketOrderCreator extends MarketOrderCreator {
  orderType = OrderType.MARKET;
  create(values: OrderlyOrder) {
    const order = super.create(values);
    return {
      ...order,
      quantity: order.order_quantity,
      type: order.order_type,
      price: order.order_price,
    };
  }

  async validate(
    values: OrderlyOrder,
    config: ValuesDepConfig
  ): Promise<OrderValidationResult> {
    const value = await super.validate(values, config);

    const bracketData = await bracketOrderValidator(values as any, config);

    return { ...value, ...bracketData };
  }
}

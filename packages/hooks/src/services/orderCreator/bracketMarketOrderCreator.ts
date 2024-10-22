import { OrderlyOrder, OrderType } from "@orderly.network/types";
import { MarketOrderCreator } from "./marketOrderCreator";
import { ValuesDepConfig, VerifyResult } from "./interface";

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
  validate(
    values: OrderlyOrder,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    return super.validate(values, config);
  }
}

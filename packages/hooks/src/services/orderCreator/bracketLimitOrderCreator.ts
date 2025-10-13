import { OrderEntity, OrderType, OrderlyOrder } from "@kodiak-finance/orderly-types";
import { BracketOrder } from "@kodiak-finance/orderly-types";
import { bracketOrderValidator } from "./baseBracketOrderCreator";
import { ValuesDepConfig, OrderValidationResult } from "./interface";
import { LimitOrderCreator } from "./limitOrderCreator";

export class BracketLimitOrderCreator extends LimitOrderCreator {
  // orderType: OrderType;
  create(values: OrderlyOrder, config?: ValuesDepConfig): BracketOrder {
    const order = super.create(values, config);

    return {
      ...order,
      quantity: order.order_quantity,
      type: order.order_type,
      price: order.order_price,
    };
  }

  async validate(
    values: OrderlyOrder,
    config: ValuesDepConfig,
  ): Promise<OrderValidationResult> {
    const value = await super.validate(values, config);

    const bracketData = await bracketOrderValidator(values as any, config);

    return { ...value, ...bracketData };
  }
}

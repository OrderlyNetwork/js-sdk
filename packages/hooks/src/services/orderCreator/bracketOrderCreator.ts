import { OrderEntity, OrderType, OrderlyOrder } from "@orderly.network/types";
import { ValuesDepConfig, VerifyResult } from "./interface";
import { BracketOrder } from "@orderly.network/types/src/order";

import { LimitOrderCreator } from "./limitOrderCreator";

export class BracketOrderCreator extends LimitOrderCreator {
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

  validate(
    values: OrderlyOrder,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    return super.validate(values, config);
  }
}

import { OrderEntity, OrderType, OrderlyOrder } from "@orderly.network/types";
import { ValuesDepConfig, VerifyResult } from "./interface";
import { BracketOrder } from "@orderly.network/types";

import { LimitOrderCreator } from "./limitOrderCreator";
import { bracketOrderValidator } from "./baseBracketOrderCreator";

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
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    const value = await super.validate(values, config);

    const bracketData = await bracketOrderValidator(values as any, config);

    console.log("bracket limit order creator", value, bracketData);

    return { ...value, ...bracketData };
  }
}

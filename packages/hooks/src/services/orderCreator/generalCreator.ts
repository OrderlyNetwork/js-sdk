import { OrderEntity } from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";

export class GeneralOrderCreator extends BaseOrderCreator {
  create(data: OrderEntity): OrderEntity {
    return {
      ...this.baseOrder(data),
      order_price: data.order_price,
      order_quantity: data.order_quantity,
    };
  }
  validate(
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ): Promise<VerifyResult> {
    return super.baseValidate(values, configs);
  }
}

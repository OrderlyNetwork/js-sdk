import { OrderEntity } from "@veltodefi/types";
import { BaseOrderCreator } from "./baseCreator";
import {
  OrderFormEntity,
  ValuesDepConfig,
  OrderValidationResult,
} from "./interface";

export class GeneralOrderCreator extends BaseOrderCreator<OrderEntity> {
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
  ): Promise<OrderValidationResult> {
    return super.baseValidate(values, configs);
  }
}

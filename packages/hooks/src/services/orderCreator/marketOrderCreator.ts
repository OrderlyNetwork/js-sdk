import { OrderEntity } from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import {
  OrderFormEntity,
  ValuesDepConfig,
  OrderValidationResult,
} from "./interface";

export class MarketOrderCreator extends BaseOrderCreator<OrderEntity> {
  create(values: OrderEntity) {
    const data = this.baseOrder(values);

    delete data["order_price"];
    delete data["total"];
    delete data["trigger_price"];
    delete data["isStopOrder"];

    return {
      ...data,
    };
  }
  validate(
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ): Promise<OrderValidationResult> {
    return this.baseValidate(values, configs);
  }
}

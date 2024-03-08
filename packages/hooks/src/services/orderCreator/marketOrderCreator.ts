import { OrderEntity } from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";

export class MarketOrderCreator extends BaseOrderCreator {
  create(values: OrderEntity): OrderEntity {
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
  ): Promise<VerifyResult> {
    return this.baseValidate(values, configs);
  }
}

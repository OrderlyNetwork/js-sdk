import { AlogRootOrderType, OrderEntity } from "@orderly.network/types";
import { LimitOrderCreator } from "./limitOrderCreator";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";

export class StopMarketOrderCreator extends LimitOrderCreator {
  create(values: OrderEntity, _: ValuesDepConfig): OrderEntity {
    const result = {
      ...this.baseOrder(values),
      // order_price: values.order_price,
      trigger_price: values.trigger_price,
      algo_type: AlogRootOrderType.STOP,
      type: "MARKET",
      quantity: values["order_quantity"],
      // price: values["order_price"],
      trigger_price_type: "MARK_PRICE",
    };
    delete result["order_quantity"];
    delete result["order_price"];
    // @ts-ignore
    delete result["order_type"];
    // @ts-ignore
    delete result["isStopOrder"];
    delete result["total"];

    console.log("result is", result);
    return result;
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);
      // @ts-ignore
      const { order_price, trigger_price, side } = values;

      if (!trigger_price) {
        errors.trigger_price = {
          type: "required",
          message: "Trigger price is required",
        };
      }

      return errors;
    });
  }
}

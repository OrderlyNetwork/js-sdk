import { pick } from "ramda";
import {
  AlgoOrderEntity,
  AlgoOrderRootType,
  OrderEntity,
  OrderType,
  TriggerPriceType,
} from "@veltodefi/types";
import { BaseOrderCreator } from "./baseCreator";
import {
  OrderFormEntity,
  ValuesDepConfig,
  OrderValidationResult,
} from "./interface";
import { OrderValidation } from "./orderValidation";

export class StopMarketOrderCreator extends BaseOrderCreator<AlgoOrderEntity> {
  create(
    values: AlgoOrderEntity & {
      order_quantity: number;
      order_price: number;
    },
  ) {
    const order = {
      ...this.baseOrder(values as unknown as OrderEntity),
      // order_price: values.order_price,
      trigger_price: values.trigger_price!,
      algo_type: AlgoOrderRootType.STOP,
      type: OrderType.MARKET,
      quantity: values["order_quantity"]!,
      // price: values["order_price"],
      trigger_price_type: TriggerPriceType.MARK_PRICE,
    };

    return pick(
      [
        "symbol",
        "trigger_price",
        "algo_type",
        "type",
        "quantity",
        // "price",
        "trigger_price_type",
        "side",
        "reduce_only",
        "visible_quantity",
      ],
      order,
    );
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig,
  ): Promise<OrderValidationResult> {
    return this.baseValidate(values, config).then((errors) => {
      const { trigger_price } = values;
      const { symbol } = config;
      const { quote_max, quote_min } = symbol;

      if (!trigger_price) {
        errors.trigger_price = OrderValidation.required("trigger_price");
      } else if (trigger_price > quote_max) {
        // validate trigger price
        errors.trigger_price = OrderValidation.max("trigger_price", quote_max);
      } else if (trigger_price < quote_min || trigger_price == 0) {
        errors.trigger_price = OrderValidation.min("trigger_price", quote_min);
      }

      return errors;
    });
  }
}

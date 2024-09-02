import {
  AlgoOrderEntity,
  AlgoOrderRootType,
  OrderEntity,
  OrderType,
  TriggerPriceType,
} from "@orderly.network/types";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";

import { pick } from "ramda";
import { BaseOrderCreator } from "./baseCreator";

export class StopMarketOrderCreator extends BaseOrderCreator<AlgoOrderEntity> {
  create(
    values: AlgoOrderEntity & {
      order_quantity: number;
      order_price: number;
    }
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
      order
    );

    // return order;
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);
      // @ts-ignore
      const { order_price, trigger_price, side } = values;
      const { symbol } = config;
      const { quote_max, quote_min } = symbol;

      if (!trigger_price) {
        errors.trigger_price = {
          type: "required",
          message: "Trigger price is required",
        };
      }

      // validate trigger price
      if (trigger_price > quote_max) {
        errors.trigger_price = {
          type: "max",
          message: `Trigger price must be less than ${quote_max}`,
        };
      } else if (trigger_price < quote_min) {
        errors.trigger_price = {
          type: "min",
          message: `Trigger price must be greater than ${quote_min}`,
        };
      }

      return errors;
    });
  }
}

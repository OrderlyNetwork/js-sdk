import {
  AlgoOrderEntry,
  AlogOrderRootType,
  OrderEntity,
  OrderType,
  TriggerPriceType,
} from "@orderly.network/types";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";

import { pick } from "ramda";
import { BaseOrderCreator } from "./baseCreator";

export class StopMarketOrderCreator extends BaseOrderCreator<AlgoOrderEntry> {
  create(
    values: AlgoOrderEntry & {
      order_quantity: number;
      order_price: number;
    },
    config: ValuesDepConfig
  ) {
    const order = {
      ...this.baseOrder(values as unknown as OrderEntity),
      // order_price: values.order_price,
      trigger_price: values.trigger_price!,
      algo_type: AlogOrderRootType.STOP,
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

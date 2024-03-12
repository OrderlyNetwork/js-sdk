import {
  AlgoOrderEntry,
  AlogRootOrderType,
  OrderEntity,
  TriggerPriceType,
} from "@orderly.network/types";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";
import { Decimal } from "@orderly.network/utils";
import { order as orderUntil } from "@orderly.network/perp";
import { BaseOrderCreator } from "./baseCreator";
import { OrderType } from "@orderly.network/types";
import { pick } from "ramda";

const { maxPrice, minPrice, scropePrice } = orderUntil;

export class StopLimitOrderCreator extends BaseOrderCreator {
  create(values: OrderEntity, config: ValuesDepConfig): AlgoOrderEntry {
    this.totalToQuantity(values, config);

    const order: AlgoOrderEntry = {
      ...this.baseOrder(values as OrderEntity),

      trigger_price: values.trigger_price!,
      algo_type: AlogRootOrderType.STOP,
      type: OrderType.LIMIT,
      quantity: values["order_quantity"]!,
      price: values["order_price"],
      trigger_price_type: TriggerPriceType.MARK_PRICE,
    };

    return pick(
      [
        "symbol",
        "trigger_price",
        "algo_type",
        "type",
        "quantity",
        "price",
        "trigger_price_type",
        "side",
        "reduce_only",
        "visible_quantity",
      ],
      order
    );
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);
      // @ts-ignore
      const { order_price, trigger_price, side } = values;

      if (!order_price) {
        errors.order_price = {
          type: "required",
          message: "price is required",
        };
      }

      if (!trigger_price) {
        errors.trigger_price = {
          type: "required",
          message: "Trigger price is required",
        };
      }

      if (trigger_price && order_price) {
        const price = new Decimal(order_price);
        const { symbol } = config;
        const { price_range, price_scope } = symbol;
        const maxPriceNumber = maxPrice(trigger_price, price_range);
        const minPriceNumber = minPrice(trigger_price, price_range);
        const scropePriceNumbere = scropePrice(
          trigger_price,
          price_scope,
          side
        );

        const priceRange =
          side === "BUY"
            ? {
                min: scropePriceNumbere,
                max: maxPriceNumber,
              }
            : {
                min: minPriceNumber,
                max: scropePriceNumbere,
              };

        /// if side is 'buy', only check max price,
        /// if side is 'sell', only check min price,
        if (price.gt(priceRange?.max)) {
          errors.order_price = {
            type: "max",
            message: `Price must be less than ${new Decimal(
              priceRange.max
            ).todp(symbol.quote_dp)}`,
          };
        }
        if (price.lt(priceRange?.min)) {
          errors.order_price = {
            type: "min",
            message: `Price must be greater than ${new Decimal(
              priceRange.min
            ).todp(symbol.quote_dp)}`,
          };
        }
      }

      return errors;
    });
  }
}

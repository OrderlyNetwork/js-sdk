import { pick } from "ramda";
import { order as orderUntil } from "@kodiak-finance/orderly-perp";
import {
  AlgoOrderEntity,
  AlgoOrderRootType,
  TriggerPriceType,
  OrderlyOrder,
} from "@kodiak-finance/orderly-types";
import { OrderType } from "@kodiak-finance/orderly-types";
import { Decimal } from "@kodiak-finance/orderly-utils";
import { BaseOrderCreator } from "./baseCreator";
import {
  OrderFormEntity,
  ValuesDepConfig,
  OrderValidationResult,
} from "./interface";
import { OrderValidation } from "./orderValidation";

const { maxPrice, minPrice, scopePrice: scopePrice } = orderUntil;

export class StopLimitOrderCreator extends BaseOrderCreator<AlgoOrderEntity> {
  create(
    values: AlgoOrderEntity & {
      order_quantity: number;
      order_price: number;
    },
    config?: ValuesDepConfig,
  ): AlgoOrderEntity<AlgoOrderRootType.STOP> {
    this.totalToQuantity(values, config!);

    const order: AlgoOrderEntity<AlgoOrderRootType.STOP> = {
      ...this.baseOrder(values as unknown as OrderlyOrder),

      trigger_price: values.trigger_price!,
      algo_type: AlgoOrderRootType.STOP,
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
      order,
    );
  }

  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig,
  ): Promise<OrderValidationResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);
      // @ts-ignore
      const { order_price, trigger_price, side } = values;
      const { symbol } = config;
      const { price_range, price_scope, quote_max, quote_min } = symbol;

      if (!order_price) {
        errors.order_price = OrderValidation.required("order_price");
      }

      if (!trigger_price) {
        errors.trigger_price = OrderValidation.required("trigger_price");
      } else {
        // validate trigger price
        if (trigger_price > quote_max) {
          errors.trigger_price = OrderValidation.max(
            "trigger_price",
            quote_max,
          );
        } else if (trigger_price < quote_min || trigger_price == 0) {
          errors.trigger_price = OrderValidation.min(
            "trigger_price",
            quote_min,
          );
        } else if (order_price) {
          const price = new Decimal(order_price);

          const maxPriceNumber = maxPrice(trigger_price, price_range);
          const minPriceNumber = minPrice(trigger_price, price_range);
          const scropePriceNumbere = scopePrice(
            trigger_price,
            price_scope,
            side,
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
          if (price.gt(quote_max)) {
            errors.order_price = OrderValidation.max("order_price", quote_max);
          } else {
            if (price.gt(priceRange?.max)) {
              errors.order_price = OrderValidation.max(
                "order_price",
                new Decimal(priceRange.max).todp(symbol.quote_dp).toString(),
              );
            }
          }

          if (price.lt(quote_min)) {
            errors.order_price = OrderValidation.min("order_price", quote_min);
          } else {
            if (price.lt(priceRange?.min)) {
              errors.order_price = OrderValidation.min(
                "order_price",
                new Decimal(priceRange.min).todp(symbol.quote_dp).toString(),
              );
            }
          }
        }
      }

      return errors;
    });
  }

  orderType: OrderType.STOP_LIMIT = OrderType.STOP_LIMIT;
}

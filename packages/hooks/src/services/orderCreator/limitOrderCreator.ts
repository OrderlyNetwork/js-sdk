import {
  OrderEntity,
  OrderSide,
  OrderType,
  OrderlyOrder,
} from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import {
  OrderFormEntity,
  ValuesDepConfig,
  OrderValidationResult,
} from "./interface";
import { Decimal } from "@orderly.network/utils";
import { order as orderUntil } from "@orderly.network/perp";
import { pick } from "ramda";
import { OrderValidation } from "./orderValidation";

const { maxPrice, minPrice, scopePrice } = orderUntil;

export class LimitOrderCreator<
  T extends OrderEntity = OrderlyOrder
> extends BaseOrderCreator<T> {
  create(values: OrderlyOrder, config?: ValuesDepConfig): T {
    const order = {
      ...this.baseOrder(values),
      order_price: values.order_price,
    };

    this.totalToQuantity(order, config!);

    return pick(
      [
        "symbol",
        "order_price",
        "order_quantity",
        "visible_quantity",
        "reduce_only",
        "side",
        "order_type",
        "algo_type",
        "child_orders",
      ],
      order
    );

    // return order;
  }

  validate(
    values: OrderlyOrder,
    config: ValuesDepConfig
  ): Promise<OrderValidationResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);
      // @ts-ignore
      const { order_price, side } = values;

      if (!order_price) {
        errors.order_price = OrderValidation.required("order_price");
      } else {
        const price = new Decimal(order_price);
        const { symbol } = config;
        const { price_range, price_scope, quote_max, quote_min } = symbol;
        const maxPriceNumber = maxPrice(config.markPrice, price_range);
        const minPriceNumber = minPrice(config.markPrice, price_range);
        const scopePriceNumber = scopePrice(
          config.markPrice,
          price_scope,
          side
        );

        const priceRange =
          side === "BUY"
            ? {
                min: scopePriceNumber,
                max: maxPriceNumber,
              }
            : {
                min: minPriceNumber,
                max: scopePriceNumber,
              };

        /// if side is 'buy', only check max price,
        /// if side is 'sell', only check min price,
        if (price.gt(quote_max)) {
          errors.order_price = OrderValidation.max("order_price", quote_max);
        } else {
          if (price.gt(priceRange?.max)) {
            errors.order_price = OrderValidation.max(
              "order_price",
              new Decimal(priceRange.max).todp(symbol.quote_dp).toString()
            );
          }
        }

        if (price.lt(quote_min)) {
          errors.order_price = OrderValidation.min("order_price", quote_min);
        } else {
          if (price.lt(priceRange?.min)) {
            errors.order_price = OrderValidation.min(
              "order_price",
              new Decimal(priceRange.min).todp(symbol.quote_dp).toString()
            );
          }
        }
      }

      // errors = this.validateBracketOrder(values, config, errors);

      return errors;
    });
  }

  orderType = OrderType.LIMIT;
}

import {
  OrderEntity,
  OrderSide,
  OrderType,
  OrderlyOrder,
} from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";
import { Decimal } from "@orderly.network/utils";
import { order as orderUntil } from "@orderly.network/perp";
import { pick } from "ramda";

const { maxPrice, minPrice, scropePrice } = orderUntil;

export class LimitOrderCreator extends BaseOrderCreator<OrderEntity> {
  create(values: OrderlyOrder, config?: ValuesDepConfig): OrderEntity {
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
  ): Promise<VerifyResult> {
    return this.baseValidate(values, config).then((errors) => {
      // const errors = this.baseValidate(values, config);
      // @ts-ignore
      const { order_price, side } = values;

      if (!order_price) {
        errors.order_price = {
          type: "required",
          message: "Price is required",
        };
      } else {
        const price = new Decimal(order_price);
        const { symbol } = config;
        const { price_range, price_scope, quote_max, quote_min } = symbol;
        const maxPriceNumber = maxPrice(config.markPrice, price_range);
        const minPriceNumber = minPrice(config.markPrice, price_range);
        const scropePriceNumbere = scropePrice(
          config.markPrice,
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
        if (price.gt(quote_max)) {
          errors.order_price = {
            type: "max",
            message: `Price must be less than ${quote_max}`,
          };
        } else {
          if (price.gt(priceRange?.max)) {
            errors.order_price = {
              type: "max",
              message: `Price must be less than ${new Decimal(
                priceRange.max
              ).todp(symbol.quote_dp)}`,
            };
          }
        }

        if (price.lt(quote_min)) {
          errors.order_price = {
            type: "min",
            message: `Price must be greater than ${quote_min}`,
          };
        } else {
          if (price.lt(priceRange?.min)) {
            errors.order_price = {
              type: "min",
              message: `Price must be greater than ${new Decimal(
                priceRange.min
              ).todp(symbol.quote_dp)}`,
            };
          }
        }
      }

      errors = this.validateBracketOrder(values, config, errors);

      return errors;
    });
  }

  private validateBracketOrder(
    values: OrderlyOrder,
    config: ValuesDepConfig,
    errors: {
      [P in keyof OrderlyOrder]?: { type: string; message: string };
    }
  ) {
    const { tp_trigger_price, sl_trigger_price, side, order_price } = values;

    if (!tp_trigger_price && !sl_trigger_price) return errors;

    const hasTPPrice = !!tp_trigger_price;
    const hasSLPrice = !!sl_trigger_price;
    const { symbol } = config;
    const { price_range, price_scope, quote_max, quote_min } = symbol;

    if (hasTPPrice) {
      const tpPrice = new Decimal(tp_trigger_price);
      if (tpPrice.gt(quote_max)) {
        errors.tp_trigger_price = {
          type: "max",
          message: `TP price must be less than ${quote_max}`,
        };
      }
      if (tpPrice.lt(quote_min)) {
        errors.tp_trigger_price = {
          type: "min",
          message: `TP price must be greater than ${quote_min}`,
        };
      }

      if (side === OrderSide.BUY) {
        if (tpPrice.lte(order_price)) {
          errors.tp_trigger_price = {
            type: "tpPrice < order_price",
            message: `TP must be greater than ${order_price}`,
          };
        }
      }

      if (side === OrderSide.SELL) {
        if (tpPrice.gte(order_price)) {
          errors.tp_trigger_price = {
            type: "tpPrice > order_price",
            message: `TP price must be less than ${order_price}`,
          };
        }
      }
    }

    if (hasSLPrice) {
      const slPrice = new Decimal(sl_trigger_price);
      if (slPrice.gt(quote_max)) {
        errors.sl_trigger_price = {
          type: "max",
          message: `SL price must be less than ${quote_max}`,
        };
      }
      if (slPrice.lt(quote_min)) {
        errors.sl_trigger_price = {
          type: "min",
          message: `SL price must be greater than ${quote_min}`,
        };
      }

      if (side === OrderSide.BUY) {
        if (slPrice.gte(order_price)) {
          errors.sl_trigger_price = {
            type: "slPrice > order_price",
            message: `SL price must be less than ${order_price}`,
          };
        }
        //SL price < mark_price * price_scope
      }

      if (side === OrderSide.SELL) {
        if (slPrice.lte(order_price)) {
          errors.sl_trigger_price = {
            type: "slPrice < order_price",
            message: `SL price must be greater than ${order_price}`,
          };
        }
      }
    }

    return errors;
  }

  orderType = OrderType.LIMIT;
}

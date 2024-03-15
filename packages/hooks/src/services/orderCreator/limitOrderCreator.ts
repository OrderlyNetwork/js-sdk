import { OrderEntity } from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";
import { Decimal } from "@orderly.network/utils";
import { order as orderUntil } from "@orderly.network/perp";
import { pick } from "ramda";
import { AlgoOrderEntry } from "@orderly.network/types";

const { maxPrice, minPrice, scropePrice } = orderUntil;

export class LimitOrderCreator extends BaseOrderCreator<OrderEntity> {
  create(values: OrderEntity, config: ValuesDepConfig): OrderEntity {
    const order = {
      ...this.baseOrder(values),
      order_price: values.order_price,
    };

    this.totalToQuantity(order, config);

    // delete order["total"];
    // delete order["trigger_price"];
    // delete order["isStopOrder"];

    // console.log("create", order);

    return pick(
      [
        "symbol",
        "order_price",
        "order_quantity",
        "visible_quantity",
        "reduce_only",
        "side",
        "order_type",
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
      const { order_price, side } = values;

      if (!order_price) {
        errors.order_price = {
          type: "required",
          message: "price is required",
        };
      } else {
        const price = new Decimal(order_price);
        const { symbol } = config;
        const { price_range, price_scope } = symbol;
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

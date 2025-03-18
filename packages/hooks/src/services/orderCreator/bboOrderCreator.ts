import { OrderEntity, OrderlyOrder } from "@orderly.network/types";
import { pick } from "ramda";
import { BaseOrderCreator } from "./baseCreator";
import { ValuesDepConfig, OrderValidationResult } from "./interface";
import { getMinNotional } from "../../utils/createOrder";

export class BBOOrderCreator extends BaseOrderCreator<OrderEntity> {
  create(values: OrderEntity) {
    const order = {
      ...this.baseOrder(values),
      level: values.level,
    };

    return pick(
      [
        "symbol",
        "order_quantity",
        "visible_quantity",
        "reduce_only",
        "side",
        "order_type",
        "level",
      ],
      order
    );
  }

  async validate(
    values: OrderlyOrder,
    configs: ValuesDepConfig
  ): Promise<OrderValidationResult> {
    return this.baseValidate(values, configs).then((errors) => {
      delete errors["total"];

      let { order_quantity, order_price, reduce_only, level } = values;

      const { symbol } = configs;

      const { min_notional, base_tick, quote_dp, quote_tick, base_dp } =
        symbol || {};

      const minNotional = getMinNotional({
        base_tick,
        quote_tick,
        price: order_price,
        qty: order_quantity,
        min_notional,
        quote_dp,
        base_dp,
      });

      if (minNotional !== undefined && !reduce_only) {
        errors.total = {
          type: "min",
          message: `The order value should be greater or equal to ${minNotional} USDC`,
          value: minNotional,
        };
      }

      // if (level === undefined || level === null) {
      //   errors.level = {
      //     type: "required",
      //     message: "Level is required",
      //   };
      // }

      return errors;
    });
  }
}

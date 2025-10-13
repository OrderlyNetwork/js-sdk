import { pick } from "ramda";
import { OrderEntity, OrderlyOrder, OrderType } from "@kodiak-finance/orderly-types";
import { BaseOrderCreator } from "./baseCreator";
import { ValuesDepConfig, OrderValidationResult } from "./interface";

export class BBOOrderCreator extends BaseOrderCreator<OrderEntity> {
  orderType = OrderType.LIMIT;

  create(values: OrderEntity) {
    const order = {
      ...this.baseOrder(values as OrderlyOrder),
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
      order,
    );
  }

  async validate(
    values: OrderlyOrder,
    configs: ValuesDepConfig,
  ): Promise<OrderValidationResult> {
    return this.baseValidate(values, configs).then((errors) => {
      // remove getMinNotional, now it will use base validate to get min notional

      // delete errors["total"];

      // let { order_quantity, order_price, reduce_only, level } = values;

      // const { min_notional, base_tick, quote_dp, quote_tick, base_dp } =
      //   configs.symbol || {};

      // const minNotional = getMinNotional({
      //   base_tick,
      //   quote_tick,
      //   price: order_price,
      //   qty: order_quantity,
      //   min_notional,
      //   quote_dp,
      //   base_dp,
      // });

      // if (minNotional !== undefined && !reduce_only) {
      //   errors.total = {
      //     type: "min",
      //     message: `The order value should be greater or equal to ${minNotional} USDC`,
      //     value: minNotional,
      //   };
      // }

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

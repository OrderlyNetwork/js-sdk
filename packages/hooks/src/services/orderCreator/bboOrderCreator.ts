import { OrderEntity } from "@orderly.network/types";
import { pick } from "ramda";
import { BaseOrderCreator } from "./baseCreator";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";
import { checkNotional } from "../../utils/createOrder";

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
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ): Promise<VerifyResult> {
    return this.baseValidate(values, configs).then((errors) => {
      delete errors["total"];

      let { order_quantity, order_price, reduce_only } = values;

      const { symbol } = configs;

      const { min_notional, base_tick, quote_dp, quote_tick, base_dp } =
        symbol || {};

      const notionalHintStr = checkNotional({
        base_tick,
        quote_tick,
        price: order_price,
        qty: order_quantity,
        min_notional,
        quote_dp,
        base_dp,
      });

      if (notionalHintStr !== undefined && !reduce_only) {
        errors.total = {
          type: "min",
          message: notionalHintStr,
        };
      }
      return errors;
    });
  }
}

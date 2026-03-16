import { pick } from "ramda";
import { OrderEntity, OrderlyOrder, OrderType } from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { ValuesDepConfig, OrderValidationResult } from "./interface";

/**
 * Creator for BBO (Best Bid/Offer) orders
 * Uses Template Method pattern from BaseOrderCreator
 */
export class BBOOrderCreator extends BaseOrderCreator<OrderEntity> {
  orderType = OrderType.LIMIT;

  /**
   * Builds the BBO order
   * Implements template method hook
   */
  protected buildOrder(values: OrderEntity): OrderEntity {
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
        "margin_mode",
        "level",
      ],
      order,
    );
  }

  /**
   * Runs base validations
   * Implements template method hook
   */
  protected runValidations(
    values: OrderlyOrder,
    configs: ValuesDepConfig,
  ): OrderValidationResult {
    return this.baseValidate(values, configs);
  }
}

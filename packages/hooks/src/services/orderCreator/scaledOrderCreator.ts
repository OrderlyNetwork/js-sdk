import { pick } from "ramda";
import { order as orderUntil } from "@orderly.network/perp";
import {
  DistributionType,
  OrderEntity,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import {
  calcScaledOrderMinTotalAmount,
  calcScaledOrderBatchBody,
} from "../../next/useOrderEntry/helper";
import { BaseOrderCreator } from "./baseCreator";
import {
  ValuesDepConfig,
  OrderValidationResult,
  OrderValidationItem,
} from "./interface";
import { OrderValidation } from "./orderValidation";

export class ScaledOrderCreator extends BaseOrderCreator<OrderEntity> {
  orderType = OrderType.SCALED;
  create(values: OrderEntity, config: ValuesDepConfig) {
    const orders = calcScaledOrderBatchBody(values, config.symbol);
    const { total_orders, distribution_type, skew } = values;

    const order = {
      ...this.baseOrder(values as unknown as OrderlyOrder),
      total_orders,
      distribution_type,
      skew,
      orders,
    };

    return pick(
      [
        "symbol",
        "order_quantity",
        "visible_quantity",
        "reduce_only",
        "side",
        "order_type",
        "orders",
        "total_orders",
        "distribution_type",
        "skew",
      ],
      order,
    );
  }

  validatePrice(values: OrderlyOrder, config: ValuesDepConfig) {
    const errors: {
      [P in keyof OrderEntity]?: OrderValidationItem;
    } = {};

    const { side, min_price, max_price } = values;
    const { price_range, price_scope, quote_max, quote_min, quote_dp } =
      config.symbol;

    const maxPriceNumber = orderUntil.maxPrice(config.markPrice, price_range);
    const minPriceNumber = orderUntil.minPrice(config.markPrice, price_range);
    const scopePriceNumber = orderUntil.scopePrice(
      config.markPrice,
      price_scope,
      side,
    );

    const priceRange =
      side === OrderSide.BUY
        ? {
            min: scopePriceNumber,
            max: maxPriceNumber,
          }
        : {
            min: minPriceNumber,
            max: scopePriceNumber,
          };

    const minPrice = Number(min_price || 0);
    const maxPrice = Number(max_price || 0);

    if (!min_price) {
      errors.min_price = OrderValidation.required("min_price");
    } else {
      if (minPrice < priceRange?.min) {
        errors.min_price = OrderValidation.min(
          "min_price",
          new Decimal(priceRange.min).todp(quote_dp).toString(),
        );
      } else if (minPrice < quote_min) {
        errors.min_price = OrderValidation.min("min_price", quote_min);
      } else if (minPrice > maxPrice) {
        errors.min_price = OrderValidation.max("min_price", max_price!);
      }
    }

    if (!max_price) {
      errors.max_price = OrderValidation.required("max_price");
    } else {
      if (maxPrice < priceRange?.min) {
        errors.max_price = OrderValidation.min(
          "max_price",
          new Decimal(priceRange.min).todp(quote_dp).toString(),
        );
      } else if (maxPrice > priceRange?.max) {
        errors.max_price = OrderValidation.max(
          "max_price",
          new Decimal(priceRange.max).todp(quote_dp).toString(),
        );
      } else if (maxPrice > quote_max) {
        errors.max_price = OrderValidation.max("max_price", quote_max);
      }
    }

    return errors;
  }

  async validate(
    values: OrderlyOrder,
    config: ValuesDepConfig,
  ): Promise<OrderValidationResult> {
    const { base_dp } = config.symbol;
    const { maxQty, askAndBid } = config;
    const { order_quantity, total_orders, distribution_type, skew } = values;

    const errors = this.validatePrice(values, config);

    if (!total_orders) {
      errors.total_orders = OrderValidation.required("total_orders");
    } else {
      const totalOrdersNum = Number(total_orders);
      if (totalOrdersNum < 2 || totalOrdersNum > 20) {
        errors.total_orders = OrderValidation.range("total_orders", 2, 20);
      }
    }

    if (distribution_type === DistributionType.CUSTOM) {
      if (!skew) {
        errors.skew = OrderValidation.required("skew");
      } else {
        const skewNum = Number(skew);
        if (skewNum <= 0) {
          errors.skew = OrderValidation.min("skew", 0);
        } else if (skewNum > 100) {
          errors.skew = OrderValidation.max("skew", 100);
        }
      }
    }

    if (!order_quantity) {
      errors.order_quantity = OrderValidation.required("order_quantity");
    } else {
      const qty = new Decimal(order_quantity);

      if (qty.gt(maxQty)) {
        errors.order_quantity = OrderValidation.max(
          "order_quantity",
          new Decimal(maxQty).todp(base_dp).toString(),
        );
      } else if (!errors.skew && !errors.total_orders) {
        // if skew and total_orders are not errors, and order_quantity is less than minTotalAmount, set error

        const minTotalAmount = calcScaledOrderMinTotalAmount(
          values,
          config.symbol,
          askAndBid!,
        );

        if (minTotalAmount && qty.lt(minTotalAmount)) {
          errors.order_quantity = OrderValidation.min(
            "order_quantity",
            minTotalAmount,
          );
        }
      }
    }

    return errors;
  }
}

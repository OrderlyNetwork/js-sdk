import { pick } from "ramda";
import {
  AlgoOrderRootType,
  API,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@veltodefi/types";
import { Decimal } from "@veltodefi/utils";
import { BaseOrderCreator } from "./baseCreator";
import { ValuesDepConfig, OrderValidationResult } from "./interface";
import { OrderValidation } from "./orderValidation";

export class TrailingStopOrderCreator extends BaseOrderCreator<OrderlyOrder> {
  orderType = OrderType.TRAILING_STOP;

  create(values: OrderlyOrder, config: ValuesDepConfig) {
    const { order_quantity, activated_price, callback_value, callback_rate } =
      values;

    const order = {
      ...this.baseOrder(values),
      algo_type: AlgoOrderRootType.TRAILING_STOP,
      type: OrderType.MARKET,
      trigger_price_type: "MARK_PRICE",
      quantity: order_quantity,
      activated_price,
      callback_value,
      callback_rate: callback_rate
        ? new Decimal(callback_rate).div(100).toString()
        : undefined,
    };

    return pick(
      [
        "symbol",
        "algo_type",
        "type",
        "trigger_price_type",
        "quantity",
        "side",
        "reduce_only",
        "visible_quantity",
        "activated_price",
        "callback_value",
        "callback_rate",
      ],
      order,
    );
  }

  async validate(
    values: OrderlyOrder,
    config: ValuesDepConfig,
  ): Promise<OrderValidationResult> {
    const { markPrice, symbol } = config;
    const { quote_dp } = config.symbol;
    const { side, activated_price, callback_value, callback_rate } = values;

    const errors = await this.baseValidate(values, config);

    if (activated_price) {
      const { minPrice, maxPrice } = getPriceRange({
        side,
        markPrice,
        symbolInfo: symbol,
      });

      const activatedPrice = new Decimal(activated_price);

      if (activatedPrice.lt(minPrice) || activatedPrice.equals(0)) {
        errors.activated_price = OrderValidation.min(
          "activated_price",
          new Decimal(minPrice).todp(quote_dp).toString(),
        );
      } else if (activatedPrice.gt(maxPrice)) {
        errors.activated_price = OrderValidation.max(
          "activated_price",
          new Decimal(maxPrice).todp(quote_dp).toString(),
        );
      }
    }

    if (!callback_value && !callback_rate) {
      errors.callback_value = OrderValidation.required("callback_value");
      errors.callback_rate = OrderValidation.required("callback_rate");
    }

    if (callback_value) {
      // 0 < callback_value < market_price
      // (callback_value - min_quote) % quote_tick == 0
      const callbackValue = new Decimal(callback_value);
      if (callbackValue.equals(0)) {
        errors.callback_value = OrderValidation.min("callback_value", "0");
      } else if (callbackValue.gt(markPrice)) {
        errors.callback_value = OrderValidation.range(
          "callback_value",
          "0",
          new Decimal(markPrice).todp(quote_dp).toString(),
        );
      }
    }

    if (callback_rate) {
      // 0.001 < callback_rate < 0.05
      // (callback_rate - 0.001) % 0.001 == 0
      const callbackRate = new Decimal(callback_rate).div(100);
      if (callbackRate.lt(0.001) || callbackRate.gt(0.05)) {
        errors.callback_rate = OrderValidation.range(
          "callback_rate",
          "0.1%",
          "5%",
        );
      }
    }
    return errors;
  }
}

/**
 * activated_price >= min_quote
 * activated_price <= max_quote
 * (activated_price - min_quote) % quote_tick == 0
 * if side == SELL:
 *     activated_price > market_price
 * else if side == BUY:
 *     activated_price < market_price
 */
function getPriceRange(inputs: {
  side: OrderSide;
  markPrice: number;
  symbolInfo: API.SymbolExt;
}) {
  const { markPrice, side, symbolInfo } = inputs;
  const { quote_min, quote_max } = symbolInfo;

  const priceRange =
    side === OrderSide.BUY
      ? {
          min: quote_min,
          max: markPrice,
        }
      : {
          min: markPrice,
          max: quote_max,
        };

  const minPrice = Math.max(quote_min, priceRange?.min);
  const maxPrice = Math.min(quote_max, priceRange?.max);

  return {
    minPrice,
    maxPrice,
  };
}

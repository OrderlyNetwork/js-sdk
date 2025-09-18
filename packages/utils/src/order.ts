import { API, OrderSide } from "@orderly.network/types";
import Decimal from "./decimal";

/**
 * Trailing stop price calculation
 * If using trailing_value
 * Long (buy): trailing_stop = extreme_price - trailing_value
 * Short (sell): trailing_stop = extreme_price + trailing_value
 *
 * If using trailing_rate
 * Long (buy): extreme_price * (1 - trailing_rate)
 * Short (sell): extreme_price * (1 + trailing_rate)
 */
export function getTrailingStopPrice(order: API.AlgoOrderExt) {
  const { side, extreme_price, callback_value, callback_rate } = order;

  const isBuy = side === OrderSide.BUY;

  if (!extreme_price) {
    return 0;
  }

  if (callback_value) {
    return isBuy
      ? new Decimal(extreme_price).plus(callback_value).toNumber()
      : new Decimal(extreme_price).minus(callback_value).toNumber();
  }

  if (callback_rate) {
    return isBuy
      ? new Decimal(extreme_price)
          .mul(new Decimal(1).plus(callback_rate))
          .toNumber()
      : new Decimal(extreme_price)
          .mul(new Decimal(1).minus(callback_rate))
          .toNumber();
  }

  return 0;
}

export function getTPSLDirection(inputs: {
  side: OrderSide;
  type: "tp" | "sl";
  closePrice: number;
  orderPrice: number;
}) {
  const { side, type, closePrice, orderPrice } = inputs;

  let direction = 1;
  if (side === OrderSide.BUY) {
    if (type === "tp") {
      // close price >= order price
      direction = closePrice >= orderPrice ? 1 : -1;
    } else {
      // close price < order price
      direction = closePrice < orderPrice ? -1 : 1;
    }
  }

  if (side === OrderSide.SELL) {
    if (type === "tp") {
      // close price <= order price
      direction = closePrice <= orderPrice ? 1 : -1;
    } else {
      // close price > order price
      direction = closePrice > orderPrice ? -1 : 1;
    }
  }

  return direction;
}

import { OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export function getDirection(inputs: {
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

import {
  API,
  AlgoOrderType,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import { isPositionalTPSL } from "@orderly.network/utils";
import { ValuesDepConfig, OrderValidationResult } from "./interface";
import { TPSLValidationStrategy } from "./validators/TPSLValidationStrategy";

/** Validate a leaf using its server-owned type and the same rules as the TP/SL form. */
export function validateTPSLChild(
  order: Partial<API.AlgoOrder>,
  changes: { trigger_price?: number | string; price?: number | string },
  config: Pick<ValuesDepConfig, "symbol" | "markPrice">,
): OrderValidationResult {
  const leg = order.algo_type === AlgoOrderType.TAKE_PROFIT ? "tp" : "sl";
  const errors = new TPSLValidationStrategy().validate(
    {
      side: order.side === OrderSide.SELL ? OrderSide.BUY : OrderSide.SELL,
      position_type: isPositionalTPSL(order)
        ? PositionType.FULL
        : PositionType.PARTIAL,
      [`${leg}_trigger_price`]: changes.trigger_price ?? order.trigger_price,
      [`${leg}_order_price`]: changes.price ?? order.price,
      [`${leg}_order_type`]:
        order.type === OrderType.LIMIT ? OrderType.LIMIT : OrderType.MARKET,
    },
    // No quantity is ever set below, so the strategy's quantity checks are
    // unreachable; maxQty is a required placeholder in ValuesDepConfig.
    { ...config, maxQty: 0 },
  );
  const mapped: OrderValidationResult = {};
  if (errors?.[`${leg}_trigger_price`])
    mapped.trigger_price = errors[`${leg}_trigger_price`];
  if (errors?.[`${leg}_order_price`])
    mapped.order_price = errors[`${leg}_order_price`];
  return mapped;
}

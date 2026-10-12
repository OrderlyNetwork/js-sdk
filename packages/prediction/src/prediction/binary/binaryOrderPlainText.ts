import { Decimal } from "@orderly.network/utils";
import type { PredictionOpenOrder } from "../prediction.types";
import {
  binaryOrderDisplayPrice,
  binaryOrderExecutedValue,
} from "./binaryOrderDisplay";

/** Export the same UP/DOWN prices and actual executions as the order cells. */
export function binaryOrderPlainText(
  order: PredictionOpenOrder,
  field: string,
): string {
  const executed = binaryOrderExecutedValue(order);
  const values: Record<string, string> = {
    symbol: `${order.symbol ?? ""} (${order.outcome})`,
    side: order.outcome,
    fill_quantity: `${order.filledQuantity ?? 0} / ${order.quantity}`,
    quantity: String(order.quantity),
    price:
      order.type === "market"
        ? "Market"
        : String(binaryOrderDisplayPrice(order, order.price)),
    average_executed_price:
      order.averagePrice != null && order.filledQuantity > 0
        ? String(binaryOrderDisplayPrice(order, order.averagePrice))
        : "--",
    executed: executed == null ? "--" : String(executed),
    notional:
      !order.status || ["pending", "partialFilled"].includes(order.status)
        ? new Decimal(order.quantity)
            .mul(binaryOrderDisplayPrice(order, order.price))
            .toString()
        : executed == null
          ? "--"
          : String(executed),
    total_fee:
      order.totalFee == null
        ? "--"
        : `${order.totalFee} ${order.feeAsset ?? "USDC"}`,
    status: order.status ?? "pending",
    created_time: new Date(order.timestamp).toISOString(),
    action: "",
  };
  return values[field] ?? "--";
}

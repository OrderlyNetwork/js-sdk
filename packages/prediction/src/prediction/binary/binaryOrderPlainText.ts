import { i18n } from "@orderly.network/i18n";
import { Decimal } from "@orderly.network/utils";
import type { PredictionOpenOrder } from "../prediction.types";
import { outcomeLabels, sideLabels } from "../predictionLabels";
import {
  binaryOrderDisplayPrice,
  binaryOrderDisplaySide,
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
    side: `${sideLabels()[binaryOrderDisplaySide(order)]} ${outcomeLabels()[order.outcome]}`,
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
    // Merged CSVs mix perp rows (rendered by ui-orders reduceOnly column) with
    // these rows; both must go through i18n "common.yes"/"common.no" so one
    // column never shows two different words.
    reduce_only: order.reduceOnly ? i18n.t("common.yes") : i18n.t("common.no"),
    status: order.status ?? "pending",
    created_time: new Date(order.timestamp).toISOString(),
    action: "",
  };
  return values[field] ?? "--";
}

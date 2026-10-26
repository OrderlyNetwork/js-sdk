import { i18n } from "@orderly.network/i18n";
import type { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { outcomeLabels, sideLabels } from "../predictionLabels";
import {
  binaryOrderOutcome,
  binaryOrderDisplayType,
  binaryOrderDisplayStatus,
  binaryOrderDisplayPrice,
  binaryOrderDisplaySide,
  binaryOrderExecutedValue,
} from "./binaryOrderDisplay";

/** Export the same UP/DOWN prices and actual executions as the order cells. */
export function binaryOrderPlainText(order: API.Order, field: string): string {
  const executed = binaryOrderExecutedValue(order);
  const values: Record<string, string> = {
    symbol: `${order.symbol ?? ""} (${binaryOrderOutcome(order)})`,
    side: `${sideLabels()[binaryOrderDisplaySide(order)]} ${outcomeLabels()[binaryOrderOutcome(order)]}`,
    fill_quantity: `${order.total_executed_quantity ?? 0} / ${order.quantity}`,
    quantity: String(order.quantity),
    price:
      binaryOrderDisplayType(order) === "market"
        ? "Market"
        : order.price == null || !Number.isFinite(order.price)
          ? "--"
          : String(binaryOrderDisplayPrice(order, order.price)),
    average_executed_price:
      Number.isFinite(order.average_executed_price) &&
      order.total_executed_quantity > 0
        ? String(binaryOrderDisplayPrice(order, order.average_executed_price))
        : "--",
    executed: executed == null ? "--" : String(executed),
    notional: ["pending", "partialFilled"].includes(
      binaryOrderDisplayStatus(order),
    )
      ? order.price == null || !Number.isFinite(order.price)
        ? "--"
        : new Decimal(order.quantity)
            .mul(binaryOrderDisplayPrice(order, order.price))
            .toString()
      : executed == null
        ? "--"
        : String(executed),
    total_fee:
      order.total_fee == null || !Number.isFinite(order.total_fee)
        ? "--"
        : `${order.total_fee} ${order.fee_asset ?? "USDC"}`,
    realized_pnl:
      order.realized_pnl != null && Number.isFinite(order.realized_pnl)
        ? String(order.realized_pnl)
        : "--",
    // Merged CSVs mix perp rows (rendered by ui-orders reduceOnly column) with
    // these rows; both must go through i18n "common.yes"/"common.no" so one
    // column never shows two different words.
    reduce_only: order.reduce_only ? i18n.t("common.yes") : i18n.t("common.no"),
    status: binaryOrderDisplayStatus(order),
    created_time: new Date(order.created_time).toISOString(),
    action: "",
  };
  return values[field] ?? "--";
}

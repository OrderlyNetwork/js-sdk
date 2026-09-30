import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Button } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { OutcomeBadge, PredictionOrderSymbol, TableNumber } from "../../cells";
import type { PredictionState } from "../../prediction.script";
import { usePredictionFormatters } from "../../predictionShared";
import { PendingValue } from "./pendingValue.ui";

export const PredictionOrderCell = ({
  state,
  order,
  field,
}: {
  state: PredictionState;
  order: PredictionState["openOrders"][number];
  field: string;
}) => {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  const pending =
    !order.status ||
    order.status === "pending" ||
    order.status === "partialFilled";
  const filled = order.status === "filled";
  switch (field) {
    case "symbol":
      return <PredictionOrderSymbol order={order} />;
    case "side":
      // Badge stays UP-book-side based (BUY=UP/SELL=DOWN, TASK-22); reduce-only
      // exits get an extra label instead of a flipped badge.
      return (
        <span className="oui-flex oui-items-center oui-gap-1">
          <OutcomeBadge outcome={order.outcome} />
          {order.reduceOnly && (
            <span className="oui-text-3xs oui-text-base-contrast-54">
              {t("orderEntry.reduceOnly")}
            </span>
          )}
        </span>
      );
    case "fill_quantity":
      return pending ? (
        <PendingValue state={state} order={order} field="quantity" />
      ) : (
        <span>
          <TableNumber value={order.filledQuantity} /> /{" "}
          <TableNumber value={order.quantity} />
        </span>
      );
    case "quantity":
      return <TableNumber value={order.quantity} />;
    case "price":
      return pending ? (
        <PendingValue state={state} order={order} field="price" />
      ) : order.type === "market" ? (
        t("common.market")
      ) : (
        <TableNumber value={order.price} />
      );
    case "average_executed_price":
      return order.averagePrice != null && order.filledQuantity > 0 ? (
        <TableNumber value={order.averagePrice} />
      ) : (
        "--"
      );
    case "executed":
    case "notional":
      return (
        <TableNumber
          value={new Decimal(pending || filled ? order.quantity : 0)
            .mul(order.price)
            .toNumber()}
          dp={2}
          suffix="USDC"
        />
      );
    case "status":
      return t(
        order.status === "partialFilled"
          ? "orders.status.partialFilled"
          : order.status === "rejected"
            ? "orders.status.rejected"
            : pending
              ? "orders.status.pending"
              : filled
                ? "prediction.status.filled"
                : "prediction.status.cancelled",
      );
    case "created_time":
      return formatTableTime(order.timestamp);
    case "action":
      return pending ? (
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          disabled={state.isRegionRestricted}
          onClick={() => state.cancelOrder(order.id, order.symbol)}
        >
          {t("common.cancel")}
        </Button>
      ) : null;
    default:
      return "--";
  }
};

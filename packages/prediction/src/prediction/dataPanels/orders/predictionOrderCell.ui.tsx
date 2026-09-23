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
  order: PredictionState["openOrders"][number] & {
    status?: "filled" | "cancelled";
  };
  field: string;
}) => {
  const { t } = useTranslation();
  const { formatTableTime } = usePredictionFormatters();
  const pending = !order.status;
  const filled = order.status === "filled";
  switch (field) {
    case "symbol":
      return <PredictionOrderSymbol order={order} />;
    case "side":
      return <OutcomeBadge outcome={order.outcome} />;
    case "fill_quantity":
      return pending ? (
        <PendingValue state={state} order={order} field="quantity" />
      ) : (
        <span>
          <TableNumber value={filled ? order.quantity : 0} /> /{" "}
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
      return filled ? <TableNumber value={order.price} /> : "--";
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
        pending
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
          onClick={() => state.cancelOrder(order.id)}
        >
          {t("common.cancel")}
        </Button>
      ) : null;
    default:
      return "--";
  }
};

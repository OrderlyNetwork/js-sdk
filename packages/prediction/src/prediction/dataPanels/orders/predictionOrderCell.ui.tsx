import { useTranslation } from "@orderly.network/i18n";
import type { API } from "@orderly.network/types";
import { Button, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  binaryOrderOutcome,
  binaryOrderDisplayType,
  binaryOrderDisplayStatus,
  binaryOrderDisplayPrice,
  binaryOrderDisplaySide,
  binaryOrderExecutedValue,
} from "../../binary/binaryOrderDisplay";
import {
  OutcomeBadge,
  PredictionOrderSymbol,
  PredictionPnl,
  TableNumber,
} from "../../cells";
import type { PredictionAccountActions } from "../../prediction.types";
import { sideLabels } from "../../predictionLabels";
import { formatUsd } from "../../predictionShared";
import { PendingValue } from "./pendingValue.ui";

export interface PredictionOrderCellProps {
  state: PredictionAccountActions & {
    isRegionRestricted: boolean;
    onSelectRoundSymbol?: (symbol: string) => void;
  };
  order: API.Order;
  field: string;
}
export const PredictionOrderCell = ({
  state,
  order,
  field,
}: PredictionOrderCellProps) => {
  const { t } = useTranslation();
  const status = binaryOrderDisplayStatus(order);
  const pending = status === "pending" || status === "partialFilled";
  const filled = status === "filled";
  switch (field) {
    case "symbol":
      return (
        <PredictionOrderSymbol
          order={order}
          onSelectRoundSymbol={state.onSelectRoundSymbol}
        />
      );
    case "side":
      return (
        <span className="oui-flex oui-items-center oui-gap-1">
          <span>{sideLabels()[binaryOrderDisplaySide(order)]}</span>
          <OutcomeBadge
            outcome={binaryOrderOutcome(order)}
            muted={status === "cancelled"}
          />
        </span>
      );
    case "reduce_only":
      return t(order.reduce_only ? "common.yes" : "common.no");
    case "fill_quantity":
      return pending ? (
        <PendingValue state={state} order={order} field="quantity" />
      ) : (
        <span>
          <TableNumber value={order.total_executed_quantity} /> /{" "}
          <TableNumber value={order.quantity} />
        </span>
      );
    case "quantity":
      return <TableNumber value={order.quantity} />;
    case "price":
      return pending ? (
        <PendingValue state={state} order={order} field="price" />
      ) : binaryOrderDisplayType(order) === "market" ? (
        t("common.market")
      ) : order.price == null || !Number.isFinite(order.price) ? (
        "--"
      ) : (
        <TableNumber value={binaryOrderDisplayPrice(order, order.price)} />
      );
    case "average_executed_price":
      return Number.isFinite(order.average_executed_price) &&
        order.total_executed_quantity > 0 ? (
        <TableNumber
          value={binaryOrderDisplayPrice(order, order.average_executed_price)}
        />
      ) : (
        "--"
      );
    case "executed":
      return binaryOrderExecutedValue(order) == null ? (
        "--"
      ) : (
        <Text dir="ltr" className="oui-break-all oui-tabular-nums">
          {formatUsd(binaryOrderExecutedValue(order)!)}
        </Text>
      );
    case "notional":
      if (!pending)
        return binaryOrderExecutedValue(order) == null ? (
          "--"
        ) : (
          <Text dir="ltr" className="oui-break-all oui-tabular-nums">
            {formatUsd(binaryOrderExecutedValue(order)!)}
          </Text>
        );
      if (order.price == null || !Number.isFinite(order.price)) return "--";
      return (
        <Text dir="ltr" className="oui-break-all oui-tabular-nums">
          {formatUsd(
            new Decimal(order.quantity)
              .mul(binaryOrderDisplayPrice(order, order.price))
              .toNumber(),
          )}
        </Text>
      );
    case "realized_pnl":
      return order.realized_pnl == null ||
        !Number.isFinite(order.realized_pnl) ? (
        "--"
      ) : (
        <PredictionPnl value={order.realized_pnl} />
      );
    case "total_fee":
      return order.total_fee == null || !Number.isFinite(order.total_fee) ? (
        "--"
      ) : (
        <TableNumber
          value={order.total_fee}
          dp={6}
          suffix={order.fee_asset ?? "USDC"}
        />
      );
    case "status":
      return t(
        status === "partialFilled"
          ? "orders.status.partialFilled"
          : status === "rejected"
            ? "orders.status.rejected"
            : pending
              ? "orders.status.pending"
              : filled
                ? "prediction.status.filled"
                : "prediction.status.cancelled",
      );
    case "created_time":
      return (
        <Text.formatted
          rule="date"
          formatString="yyyy-MM-dd HH:mm:ss"
          className="oui-whitespace-nowrap oui-break-normal oui-font-semibold"
        >
          {order.created_time}
        </Text.formatted>
      );
    case "action":
      return pending ? (
        <Button
          size="sm"
          variant="outlined"
          color="secondary"
          disabled={
            state.isRegionRestricted || !state.isOrderTradable(order.symbol)
          }
          onClick={() => state.cancelOrder(order.order_id, order.symbol)}
        >
          {t("common.cancel")}
        </Button>
      ) : null;
    default:
      return "--";
  }
};

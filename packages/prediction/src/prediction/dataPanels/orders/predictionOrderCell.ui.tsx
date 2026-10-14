import { useTranslation } from "@orderly.network/i18n";
import { Button, cn, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  binaryOrderDisplayPrice,
  binaryOrderDisplaySide,
  binaryOrderExecutedValue,
} from "../../binary/binaryOrderDisplay";
import { OutcomeBadge, PredictionOrderSymbol, TableNumber } from "../../cells";
import type {
  PredictionAccountActions,
  PredictionOpenOrder,
} from "../../prediction.types";
import { formatUsd } from "../../predictionShared";
import { PendingValue } from "./pendingValue.ui";

export interface PredictionOrderCellProps {
  state: PredictionAccountActions & {
    isRegionRestricted: boolean;
    onSelectRoundSymbol?: (symbol: string) => void;
  };
  order: PredictionOpenOrder;
  field: string;
}
export const PredictionOrderCell = ({
  state,
  order,
  field,
}: PredictionOrderCellProps) => {
  const { t } = useTranslation();
  const pending =
    !order.status ||
    order.status === "pending" ||
    order.status === "partialFilled";
  const filled = order.status === "filled";
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
          <span>{t(`common.${binaryOrderDisplaySide(order)}`)}</span>
          <OutcomeBadge
            outcome={order.outcome}
            muted={order.status === "cancelled"}
          />
          {order.reduceOnly && (
            <span
              className={cn(
                "oui-text-3xs",
                order.status === "cancelled"
                  ? "oui-text-base-contrast-20"
                  : "oui-text-base-contrast-54",
              )}
            >
              {t("orderEntry.reduceOnly")}
            </span>
          )}
        </span>
      );
    case "reduce_only":
      return t(order.reduceOnly ? "common.yes" : "common.no");
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
        <TableNumber value={binaryOrderDisplayPrice(order, order.price)} />
      );
    case "average_executed_price":
      return order.averagePrice != null && order.filledQuantity > 0 ? (
        <TableNumber
          value={binaryOrderDisplayPrice(order, order.averagePrice)}
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
      return (
        <Text dir="ltr" className="oui-break-all oui-tabular-nums">
          {formatUsd(
            new Decimal(order.quantity)
              .mul(binaryOrderDisplayPrice(order, order.price))
              .toNumber(),
          )}
        </Text>
      );
    case "total_fee":
      return order.totalFee == null ? (
        "--"
      ) : (
        <TableNumber
          value={order.totalFee}
          dp={6}
          suffix={order.feeAsset ?? "USDC"}
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
      return (
        <Text.formatted
          rule="date"
          formatString="yyyy-MM-dd HH:mm:ss"
          className="oui-whitespace-nowrap oui-break-normal oui-font-semibold"
        >
          {order.timestamp}
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
          onClick={() => state.cancelOrder(order.id, order.symbol)}
        >
          {t("common.cancel")}
        </Button>
      ) : null;
    default:
      return "--";
  }
};

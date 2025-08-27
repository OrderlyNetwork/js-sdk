import { i18n } from "@orderly.network/i18n";
import { API, OrderStatus } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";
import { parseNumber } from "@orderly.network/ui";
import {
  capitalizeString,
  transSymbolformString,
} from "@orderly.network/utils";

function getDisplaySide(side: string) {
  if (side === "BUY") {
    return i18n.t("common.buy");
  } else if (side === "SELL") {
    return i18n.t("common.sell");
  }
  return capitalizeString(side);
}

export function getOrderExecutionReportMsg(
  data: API.AlgoOrder | API.Order,
  symbolsInfo: any,
) {
  const { symbol, side, quantity, client_order_id } = data;
  const total_executed_quantity =
    "total_executed_quantity" in data ? data.total_executed_quantity : 0;
  const status = "status" in data ? data.status : data.algo_status;
  const getSymbolInfo = symbolsInfo[symbol];
  const base_dp = getSymbolInfo("base_dp");
  const displaySide = getDisplaySide(side);
  const displaySymbol = transSymbolformString(symbol);
  const displayQuantity =
    "algo_type" in data && data.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
      ? i18n.t("tpsl.entirePosition")
      : base_dp === undefined
        ? quantity
        : parseNumber(quantity, { dp: base_dp });

  let title = "";
  let msg = "";
  switch (status) {
    case OrderStatus.NEW:
      const isScaledOrder = client_order_id?.startsWith("scaled_");
      // if client_order_id is scaled order, show the scaled order message
      if (isScaledOrder) {
        title = i18n.t("orders.status.scaledSubOrderOpened.toast.title");
        msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      } else {
        title = i18n.t("orders.status.opened.toast.title");
        msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      }

      break;
    case OrderStatus.FILLED:
    case OrderStatus.PARTIAL_FILLED:
      const displayTotalExecutedQuantity =
        base_dp === undefined
          ? total_executed_quantity
          : parseNumber(total_executed_quantity, { dp: base_dp });
      title = i18n.t("orders.status.filled.toast.title");
      msg = `${displaySide} ${displaySymbol} ${displayTotalExecutedQuantity} / ${displayQuantity}`;
      break;
    case OrderStatus.CANCELLED:
      title = i18n.t("orders.status.canceled.toast.title");
      msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case OrderStatus.REJECTED:
      title = i18n.t("orders.status.rejected.toast.title");
      msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case OrderStatus.REPLACED:
      title = i18n.t("orders.status.replaced.toast.title");
      msg = `${side} ${displaySymbol} ${total_executed_quantity} / ${displayQuantity}`;
      break;
    default:
      break;
  }

  return {
    title,
    msg,
    status,
  };
}

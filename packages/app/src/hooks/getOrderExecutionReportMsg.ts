import {
  capitalizeString,
  transSymbolformString,
} from "@orderly.network/utils";
import { API } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";
import { parseNumber } from "@orderly.network/ui";
import { i18n } from "@orderly.network/i18n";

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
  symbolsInfo: any
) {
  const { symbol, side, quantity } = data;
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
    case "NEW":
      title = i18n.t("orders.status.new.title");
      msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case "FILLED":
    case "PARTIAL_FILLED":
      const displayTotalExecutedQuantity =
        base_dp === undefined
          ? total_executed_quantity
          : parseNumber(total_executed_quantity, { dp: base_dp });
      title = i18n.t("orders.status.filled.title");
      msg = `${displaySide} ${displaySymbol} ${displayTotalExecutedQuantity} / ${displayQuantity}`;
      break;
    case "CANCELLED":
      title = i18n.t("orders.status.cancelled.title");
      msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case "REJECTED":
      title = i18n.t("orders.status.rejected.title");
      msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case "REPLACED":
      title = i18n.t("orders.status.replaced.title");
      msg = `${side} ${displaySymbol} ${total_executed_quantity} / ${displayQuantity}`;
      break;
    default:
      break;
  }

  return {
    title,
    msg,
  };
}

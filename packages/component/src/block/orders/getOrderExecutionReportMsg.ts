import {
  capitalizeString,
  transSymbolformString,
} from "@orderly.network/utils";
import { parseNumber } from "@/utils/num";
import { API } from "@orderly.network/types";

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
  const displaySide = capitalizeString(side);
  const displaySymbol = transSymbolformString(symbol);
  const displayQuantity =
    base_dp === undefined
      ? quantity
      : parseNumber(quantity, { precision: base_dp });

  let title = "";
  let msg = "";
  switch (status) {
    case "NEW":
      title = "Order opened";
      msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case "FILLED":
    case "PARTIAL_FILLED":
      const displayTotalExecutedQuantity =
        base_dp === undefined
          ? total_executed_quantity
          : parseNumber(total_executed_quantity, { precision: base_dp });
      title = "Order filled";
      msg = `${displaySide} ${displaySymbol} ${displayTotalExecutedQuantity} / ${displayQuantity}`;
      break;
    case "CANCELLED":
      title = "Order cancelled";
      msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case "REJECTED":
      title = "Order rejected";
      msg = `${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case "REPLACED":
      title = "Order edited";
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

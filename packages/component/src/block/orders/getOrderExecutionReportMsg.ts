import {
  capitalizeString,
  transSymbolformString,
} from "@orderly.network/utils";
import { parseNumber } from "@/utils/num";

export function getOrderExecutionReportMsg(data: any, symbolsInfo: any) {
  const { symbol, status, side, quantity, totalExecutedQuantity } = data;
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
      msg = `Order opened ${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case "FILLED":
    case "PARTIAL_FILLED":
      const displayTotalExecutedQuantity =
        base_dp === undefined
          ? totalExecutedQuantity
          : parseNumber(totalExecutedQuantity, { precision: base_dp });
      title = "Order filled";
      msg = `Order filled ${displaySide} ${displaySymbol} ${displayTotalExecutedQuantity} / ${displayQuantity}`;
      break;
    case "CANCELLED":
      title = "Order cancelled";
      msg = `Order cancelled ${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case "REJECTED":
      title = "Order rejected";
      msg = `Order rejected ${displaySide} ${displaySymbol} ${displayQuantity}`;
      break;
    case "REPLACED":
      title = "Order edited";
      msg = `${side} ${displaySymbol} ${totalExecutedQuantity} / ${displayQuantity}`;
      break;
    default:
      break;
  }

  return {
    title,
    msg,
  };
}

import { capitalizeString, transSymbolformString } from "@orderly.network/utils";


export function parseExecutionReportToToastMsg(data: any, symbolsInfo: any): any | null {
    
    const { symbol } = data;
    const getSymbolInfo = symbolsInfo[symbol];
    const baseTick = getSymbolInfo("base_dp");
    const { status } = data;
    const { side } = data;
    const { quantity } = data;
    const displaySide = capitalizeString(side);
    const displaySymbol = transSymbolformString(symbol);
    const displayQuantity = baseTick === undefined ? quantity : quantity.toFixed(baseTick);
  
    let msg = '';
    let title = '';
  
    // console.log("useExecutionReport: symbol ", symbol);
    // console.log("useExecutionReport: baseTick ", baseTick);
    // console.log("useExecutionReport: displaySide ", displaySide);
    // console.log("useExecutionReport: displaySymbol ", displaySymbol);
    // console.log("useExecutionReport: displayQuantity ", displayQuantity);
    switch (status) {
      case "NEW":
        title = "Order opened";
        msg = `Order opened ${displaySide} ${displaySymbol} ${displayQuantity}`;
        break;
      case "FILLED":
      case "PARTIAL_FILLED":
        const { totalExecutedQuantity } = data;
        const displayTotalExecutedQuantity = baseTick === undefined ? totalExecutedQuantity : totalExecutedQuantity.toFixed(baseTick);
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
      default: break;
    }
  
    // console.log("useExecutionReport: 2", msg);
    if (msg.length === 0) return null;
  
    return {
      title,
      msg,
    };
  }
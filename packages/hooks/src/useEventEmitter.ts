import useConstant from "use-constant";
import { EventEmitter, SimpleDI } from "@orderly.network/core";

/** Event name for Order Entry estimated liquidation price changes; payload: { symbol: string; estLiqPrice: number | null } */
export const ORDER_ENTRY_EST_LIQ_PRICE_CHANGE = "orderEntry:estLiqPriceChange";

export const useEventEmitter = () => {
  return useConstant(() => {
    let ee = SimpleDI.get<EventEmitter>("EE");

    if (!ee) {
      ee = new EventEmitter();

      SimpleDI.registerByName("EE", ee);
    }
    return ee;
  });
};

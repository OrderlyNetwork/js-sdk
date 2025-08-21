import { useEffect, useState } from "react";
import { useDebouncedCallback, useEventEmitter } from "@orderly.network/hooks";

export function useAskAndBid() {
  const ee = useEventEmitter();

  const [askAndBid, setAskAndBid] = useState<[number, number]>([0, 0]);

  const onOrderBookUpdate = useDebouncedCallback((data: any) => {
    setAskAndBid([data.asks?.[data.asks.length - 1]?.[0], data.bids?.[0]?.[0]]);
  }, 200);

  useEffect(() => {
    ee.on("orderbook:update", onOrderBookUpdate);
    return () => {
      ee.off("orderbook:update", onOrderBookUpdate);
      onOrderBookUpdate.cancel();
    };
  }, [onOrderBookUpdate]);

  return askAndBid;
}

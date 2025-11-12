import { useEffect, useRef, useState } from "react";
import { useWS } from "../useWS";

export const useMarkPrice = (symbol: string) => {
  const ws = useWS();
  const [price, setPrice] = useState(0);

  const symbolRef = useRef<string>(symbol);
  symbolRef.current = symbol;

  useEffect(() => {
    const unsubscribe = ws.subscribe(`${symbol}@markprice`, {
      onMessage: (message: any) => {
        // when current symbol is not the same as the ws symbol, skip update data and auto unsubscribe old symbol ws
        if (message.symbol !== symbolRef.current) {
          unsubscribe?.();
          return;
        }
        setPrice(message.price);
      },
    });

    return () => {
      unsubscribe?.();
    };
  }, [symbol]);

  return { data: price };
};

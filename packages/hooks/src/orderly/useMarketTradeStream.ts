import { useEffect, useRef, useState } from "react";
import { API, SDKError } from "@orderly.network/types";
import { getTimestamp } from "@orderly.network/utils";
import { useWS } from "../useWS";

export interface MarketTradeStreamOptions {
  limit?: number;
}

export const useMarketTradeStream = (
  symbol: string,
  options: MarketTradeStreamOptions = {},
) => {
  if (!symbol) {
    throw new SDKError("Symbol is required");
  }

  const [trades, setTrades] = useState<API.Trade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const symbolRef = useRef<string>(symbol);
  symbolRef.current = symbol;

  const { limit = 50 } = options;

  const ws = useWS();

  useEffect(() => {
    setIsLoading(true);
    setTrades(() => []);
    ws.onceSubscribe(
      {
        id: `${symbol}@trade`,
        event: "request",
        params: {
          type: "trade",
          symbol: symbol,
          limit,
        },
      },
      {
        onMessage: (data: any) => {
          setIsLoading(false);
          setTrades(() => data);
        },
      },
    );
  }, [symbol]);

  useEffect(() => {
    const unsubscribe = ws.subscribe(
      {
        id: `${symbol}@trade`,
        event: "subscribe",
        topic: `${symbol}@trade`,
        ts: getTimestamp(),
      },
      {
        onMessage: (data: any) => {
          // when current symbol is not the same as the ws symbol, skip update data and auto unsubscribe old symbol ws
          if (data.symbol !== symbolRef.current) {
            unsubscribe?.();
            return;
          }
          setTrades((prev) => {
            const arr = [{ ...data, ts: getTimestamp() }, ...prev];
            if (arr.length > limit) {
              arr.pop();
            }
            return arr;
          });
        },
      },
    );

    return () => {
      unsubscribe?.();
    };
  }, [symbol]);

  return { data: trades, isLoading };
};

import { API, SDKError } from "@kodiak-finance/orderly-types";
import { useWS } from "../useWS";
import { useEffect, useState } from "react";
import { getTimestamp } from "@kodiak-finance/orderly-utils";

export interface MarketTradeStreamOptions {
  limit?: number;
}

export const useMarketTradeStream = (
  symbol: string,
  options: MarketTradeStreamOptions = {}
) => {
  if (!symbol) {
    throw new SDKError("Symbol is required");
  }

  const [trades, setTrades] = useState<API.Trade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      }
    );
  }, [symbol]);

  useEffect(() => {
    const unsubscript = ws.subscribe(
      {
        id: `${symbol}@trade`,
        event: "subscribe",
        topic: `${symbol}@trade`,
        ts: getTimestamp(),
      },
      {
        onMessage: (data: any) => {
          setTrades((prev) => {
            const arr = [{ ...data, ts: getTimestamp() }, ...prev];
            if (arr.length > limit) {
              arr.pop();
            }
            return arr;
          });
        },
      }
    );

    return () => {
      unsubscript?.();
    };
  }, [symbol]);

  return { data: trades, isLoading };
};

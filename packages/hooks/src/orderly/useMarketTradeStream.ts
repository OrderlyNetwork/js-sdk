import { API } from "@orderly.network/types";
import { useQuery } from "../useQuery";
import { useWS } from "../useWS";
import { useEffect, useState } from "react";

export interface MarketTradeStreamOptions {
  limit?: number;
}

export const useMarketTradeStream = (
  symbol: string,
  options: MarketTradeStreamOptions = {}
) => {
  if (!symbol) {
    throw new Error("useTradeStream: symbol is required");
  }

  const [trades, setTrades] = useState<API.Trade[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prevSymbol, setPrevSymbol] = useState<string>(() => symbol);

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
    // if (trades.length <= 0) return;

    const unsubscript = ws.subscribe(
      {
        id: `${symbol}@trade`,
        event: "subscribe",
        topic: `${symbol}@trade`,
        ts: Date.now(),
      },
      {
        onMessage: (data: any) => {
          //
          setTrades((prev) => {
            const arr = [{ ...data, ts: Date.now() }, ...prev];
            //
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

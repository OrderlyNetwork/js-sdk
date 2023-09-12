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

  const { limit = 50 } = options;

  // const { isLoading } = useQuery<API.Trade[]>(
  //   `/v1/public/market_trades?symbol=${symbol}&limit=${level}`,
  //   {
  //     onSuccess: (data) => {
  //       // console.log("trades ^^^^^^", data);
  //       if (Array.isArray(data)) {
  //         setTrades(() => data);
  //       }
  //       return data;
  //     },
  //   }
  // );

  // const [requestData, setRequestData] = useState<API.Trade[]>([]);

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
    if (trades.length <= 0) return;

    const unsubscript = ws.subscribe(`@${symbol}/@trade`, {
      onMessage: (data: any) => {
        // console.log("ws: trade topic", data);
        setTrades((prev) => {
          const arr = [data, ...prev];
          if (arr.length > limit) {
            arr.pop();
          }
          return arr;
        });
      },
    });

    return () => {
      unsubscript?.();
    };
  }, [symbol, trades]);

  return { data: trades, isLoading };
};

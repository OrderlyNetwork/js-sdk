import { API } from "@orderly.network/types";
import { useQuery } from "../useQuery";
import { useWS } from "../useWS";
import { useEffect, useState } from "react";

export interface MarketTradeStreamOptions {
  level?: number;
}

export const useMarketTradeStream = (
  symbol: string,
  options: MarketTradeStreamOptions = {}
) => {
  if (!symbol) {
    throw new Error("useTradeStream: symbol is required");
  }

  const [trades, setTrades] = useState<API.Trade[]>([]);

  const { level = 20 } = options;

  const { isLoading } = useQuery<API.Trade[]>(
    `/v1/public/market_trades?symbol=${symbol}&limit=${level}`,
    {
      onSuccess: (data) => {
        console.log("trades ^^^^^^", data);
        if (Array.isArray(data)) {
          setTrades(data);
        }
        return data;
      },
    }
  );

  const ws = useWS();

  useEffect(() => {
    const unsubscript = ws.subscribe(`@${symbol}/@trade`, {
      onMessage: (data: any) => {
        console.log("trade", data);
      },
    });

    return () => {
      unsubscript();
    };
  }, []);

  return { trades, isLoading };
};

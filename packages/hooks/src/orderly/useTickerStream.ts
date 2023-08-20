import { useEffect, useState } from "react";
import { useQuery } from "../useQuery";
import { useWebSocketClient } from "../useWebSocketClient";
import { WSMessage } from "@orderly/core";

export const useTickerStream = (symbol: string) => {
  const [data, setData] = useState<WSMessage.Ticker | null>(null);
  if (!symbol) {
    throw new Error("useFuturesForSymbol requires a symbol");
  }

  const ws = useWebSocketClient();

  useEffect(() => {
    const sub = ws.observe<WSMessage.Ticker>(`${symbol}@ticker`).subscribe((value) => {
      console.log("useTicker", value);
      setData(value);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  // return useQuery(`/public/futures/${symbol}`);
  return { data };
};

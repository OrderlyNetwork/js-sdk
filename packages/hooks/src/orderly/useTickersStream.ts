import { useEffect, useState } from "react";
import { useWebSocketClient } from "../useWebSocketClient";
import { WS } from "@orderly.network/core";

export const useTickersStream = () => {
  const [data, setData] = useState<WS.Ticker | null>(null);

  const ws = useWebSocketClient();

  useEffect(() => {
    const sub = ws.observe<WS.Ticker>(`tickers`).subscribe((value) => {
      setData(value);
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  // return useQuery(`/public/futures/${symbol}`);
  return { data };
};

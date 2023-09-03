import { useQuery } from "../useQuery";
import { type WSMessage } from "@orderly.network/core";
import { useWS } from "../useWS";
import useSWRSubscription from "swr/subscription";
import { useMemo } from "react";

export const useMarketsStream = () => {
  // get listing of all markets from /public/info
  const ws = useWS();
  const { data: futures } = useQuery<WSMessage.Ticker[]>(`/public/futures`);
  // const config = useSymbolsInfo();

  const { data: tickers } = useSWRSubscription("tickers", (_, { next }) => {
    const unsubscribe = ws.subscribe(
      // { event: "subscribe", topic: "markprices" },
      "tickers",
      {
        onMessage: (message: any) => {
          next(null, message);
        },
        // onUnsubscribe: () => {
        //   return "markprices";
        // },
        // onError: (error: any) => {
        //   console.log("error", error);
        // },
      }
    );

    return () => {
      //unsubscribe
      console.log("unsubscribe!!!!!!!");
      unsubscribe?.();
    };
  });

  const value = useMemo(() => {
    if (!futures) return null;
    if (!tickers) return futures;

    return futures.map((item) => {
      const ticker = tickers.find(
        (t: WSMessage.Ticker) => t.symbol === item.symbol
      );
      if (ticker) {
        return {
          ...item,
          ["24h_close"]: ticker.close,
          ["24h_open"]: ticker.open,
          ["24h_volumn"]: ticker.volume,
          change: 0,
        };
      }
      return item;
    });
  }, [futures, tickers]);

  // return listing;
  return { data: value };
};

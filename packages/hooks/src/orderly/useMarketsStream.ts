import { useMemo } from "react";
import { useQuery } from "../useQuery";
import { useWS } from "../useWS";
import useSWRSubscription from "swr/subscription";
import { WSMessage } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export const useMarketsStream = () => {
  // get listing of all markets from /public/info
  const ws = useWS();
  const { data: futures } = useQuery<WSMessage.Ticker[]>(`/v1/public/futures`, {
    revalidateOnFocus: false,
  });

  const { data: tickers } = useSWRSubscription("tickers", (_, { next }) => {
    const unsubscribe = ws.subscribe(
      // { event: "subscribe", topic: "markprices" },
      "tickers",
      {
        onMessage: (message: any) => {
          // window.debugPrint(message);
          next(null, message);
        },
        // onUnsubscribe: () => {
        //   return "markprices";
        // },
        // onError: (error: any) => {
        //
        // },
      }
    );

    return () => {
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
        const data = {
          ...item,
          ["24h_close"]: ticker.close,
          ["24h_open"]: ticker.open,
          ["24h_volumn"]: ticker.volume,
          change: 0,
        };

        if (ticker.close !== undefined && ticker.open !== undefined) {
          data["change"] = new Decimal(ticker.close)
            .minus(ticker.open)
            .div(ticker.open)
            .toNumber();
        }

        return data;
      }
      return item;
    });
  }, [futures, tickers]);

  return { data: value };
};

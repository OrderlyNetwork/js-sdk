import { useEffect, useMemo, useState } from "react";
import { useQuery } from "../useQuery";
import useSWRSubscription from "swr/subscription";
import { useWebSocketClient } from "../useWebSocketClient";
import { useObservable } from "rxjs-hooks";
import { API } from "@orderly.network/types";
import { combineLatestWith, map, startWith } from "rxjs/operators";
import { Decimal } from "@orderly.network/utils";
import { useWS } from "../useWS";

export const useTickerStream = (symbol: string) => {
  if (!symbol) {
    throw new Error("useFuturesForSymbol requires a symbol");
  }
  const { data: info } = useQuery<API.MarketInfo>(`/public/futures/${symbol}`);
  const ws = useWS();

  const { data: ticker } = useSWRSubscription(
    `${symbol}@ticker`,
    (key, { next }) => {
      const unsubscribe = ws.subscribe(
        // { event: "subscribe", topic: "markprices" },
        `${symbol}@ticker`,
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
    }
  );

  const value = useMemo(() => {
    // console.log("ticker", ticker, info);
    if (!info) return null;
    if (!ticker) return info;
    const config: any = { ...info };
    if (ticker.close !== undefined) {
      config["24h_close"] = ticker.close;
    }
    if (ticker.open !== undefined) {
      config["24h_open"] = ticker.open;
    }

    if (ticker.volume !== undefined) {
      config["24h_volumn"] = ticker.volume;
    }

    if (ticker.close !== undefined && ticker.open !== undefined) {
      config["change"] = new Decimal(ticker.close)
        .minus(ticker.open)
        .div(ticker.open)
        .toNumber();
    }
    return config;
  }, [info, ticker]);

  // return useQuery(`/public/futures/${symbol}`);
  return value;
};

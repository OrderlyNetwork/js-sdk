import { useEffect, useMemo, useState } from "react";
import { useQuery } from "../useQuery";
import useSWRSubscription from "swr/subscription";

import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { useWS } from "../useWS";

export const useTickerStream = (symbol: string) => {
  if (!symbol) {
    throw new Error("useFuturesForSymbol requires a symbol");
  }
  const { data: info } = useQuery<API.MarketInfo>(
    `/v1/public/futures/${symbol}`,
    {
      revalidateOnFocus: false,
    }
  );

  const [ticker, setTicker] = useState<API.Ticker>();

  const ws = useWS();

  // const { data: ticker } = useSWRSubscription(
  //   `${symbol}@ticker`,
  //   (key, { next }) => {

  //     return () => {
  //       //unsubscribe

  //       unsubscribe?.();
  //     };
  //   }
  // );

  useEffect(() => {
    const unsubscribe = ws.subscribe(
      // { event: "subscribe", topic: "markprices" },
      `${symbol}@ticker`,
      {
        onMessage: (message: any) => {
          if (message.symbol !== symbol) return;

          setTicker(message);
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
      setTicker(undefined);
      unsubscribe?.();
    };
  }, [symbol]);

  const value = useMemo(() => {
    //
    if (!info) return null;
    if (!ticker) return info;
    // console.log(info, symbol, ticker);
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
  }, [info, symbol, ticker]);

  // return useQuery(`/public/futures/${symbol}`);
  return value;
};

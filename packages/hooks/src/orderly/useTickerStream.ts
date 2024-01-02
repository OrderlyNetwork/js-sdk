import { useEffect, useMemo, useState } from "react";
import { useQuery } from "../useQuery";
import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { useWS } from "../useWS";
import { useMarkPrice } from "./useMarkPrice";
import { useIndexPrice } from "./useIndexPrice";
import { useOpenInterest } from "./useOpenInterest";

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

  const [ticker, setTicker] = useState<any>();

  const ws = useWS();

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

  const { data: markPrice } = useMarkPrice(symbol);
  const { data: indexPrice } = useIndexPrice(symbol);
  const { data: openInterest } = useOpenInterest(symbol);

  const value = useMemo(() => {
    //
    if (!info) return null;
    if (!ticker) return info;
    const config: any = {
      ...info,
      mark_price: markPrice,
      index_price: indexPrice,
      open_interest: openInterest,
    };

    if (ticker.open !== undefined) {
      config["24h_open"] = ticker.open;
    }

    if (ticker.close !== undefined) {
      config["24h_close"] = ticker.close;
    }

    if (ticker.high !== undefined) {
      config["24h_high"] = ticker.high;
    }

    if (ticker.low !== undefined) {
      config["24h_low"] = ticker.low;
    }

    if (ticker.volume !== undefined) {
      config["24h_volumn"] = ticker.volume;
    }

    if (ticker.close !== undefined && ticker.open !== undefined) {
      config["change"] = new Decimal(ticker.close)
        .minus(ticker.open)
        .div(ticker.open)
        .toNumber();

      config['24h_change'] = new Decimal(ticker.close)
      .minus(ticker.open);
    }
    return config;
  }, [info, symbol, ticker]);

  return value as API.MarketInfo;
};

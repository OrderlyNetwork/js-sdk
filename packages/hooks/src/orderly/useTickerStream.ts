import { useEffect, useMemo, useRef, useState } from "react";
import { API, SDKError } from "@veltodefi/types";
import { Decimal } from "@veltodefi/utils";
import { useQuery } from "../useQuery";
import { useWS } from "../useWS";
import { useFutures } from "./useFutures";
import { useIndexPrice } from "./useIndexPrice";
import { useMarkPrice } from "./useMarkPrice";
import { useOpenInterest } from "./useOpenInterest";

export const useTickerStream = (symbol: string) => {
  if (!symbol) {
    throw new SDKError("Symbol is required");
  }
  const { data: info } = useQuery<API.MarketInfo>(
    `/v1/public/futures/${symbol}`,
    {
      revalidateOnFocus: false,
    },
  );

  const [ticker, setTicker] = useState<any>();

  const symbolRef = useRef<string>(symbol);
  symbolRef.current = symbol;

  const ws = useWS();

  useEffect(() => {
    const unsubscribe = ws.subscribe(
      // { event: "subscribe", topic: "markprices" },
      `${symbol}@ticker`,
      {
        onMessage: (message: any) => {
          // when current symbol is not the same as the ws symbol, skip update data and auto unsubscribe old symbol ws
          if (message.symbol !== symbolRef.current) {
            unsubscribe?.();
            return;
          }

          setTicker(message);
        },
      },
    );

    return () => {
      setTicker(undefined);
      unsubscribe?.();
    };
  }, [symbol]);

  const { data: markPrice } = useMarkPrice(symbol);
  const { data: indexPrice } = useIndexPrice(symbol);
  const { data: openInterest } = useOpenInterest(symbol);
  const { data: futures } = useFutures();

  const value = useMemo(() => {
    //
    if (!info) return null;
    if (!ticker || ticker.symbol !== symbol) return info;

    const futureIndex = futures?.findIndex(
      (item: any) => item.symbol === symbol,
    );
    let _oi = openInterest;
    if (!_oi && futureIndex !== -1 && futures) {
      // @ts-ignore
      _oi = futures[futureIndex].open_interest;
    }

    const config: any = {
      ...info,
      mark_price: markPrice,
      index_price: indexPrice,
      open_interest: _oi,
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
      config["24h_volume"] = ticker.volume;
    }

    if (ticker.close !== undefined && ticker.open !== undefined) {
      config["change"] = new Decimal(ticker.close)
        .minus(ticker.open)
        .div(ticker.open)
        .toNumber();

      config["24h_change"] = new Decimal(ticker.close)
        .minus(ticker.open)
        .toNumber();
    }
    return config;
  }, [info, symbol, ticker, futures, openInterest]);

  return value as API.MarketInfo & { change?: number; "24h_change"?: number };
};

import { useEffect, useMemo, useRef, useState } from "react";
import { API, SDKError } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { useQuery } from "../useQuery";
import { useWS } from "../useWS";
import { useIndexPrice } from "./useIndexPrice";
import { useMarkPrice } from "./useMarkPrice";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useMarketMap } from "./useMarket/market.store";
import { useOpenInterest } from "./useOpenInterest";

const get24hChange = (open?: number | string, close?: number | string) => {
  if (
    open === undefined ||
    open === null ||
    close === undefined ||
    close === null
  ) {
    return {};
  }

  const diff = new Decimal(close).minus(open);

  return {
    change: Number(open) === 0 ? undefined : diff.div(open).toNumber(),
    "24h_change": diff.toNumber(),
  };
};

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

  const { data: markPrices } = useMarkPricesStream();
  const { data: indexPrice } = useIndexPrice(symbol);
  const { data: openInterest } = useOpenInterest(symbol);
  const marketMap = useMarketMap();

  const markPrice = useMemo(() => {
    return markPrices?.[symbol];
  }, [markPrices, symbol]);

  const value = useMemo(() => {
    if (!info) return null;
    // calculate the initial change from the REST data until the first ticker arrives
    if (!ticker || ticker.symbol !== symbol) {
      return {
        ...info,
        ...get24hChange(info["24h_open"], info["24h_close"]),
      };
    }

    const config: any = {
      ...info,
      mark_price: markPrice,
      index_price: indexPrice,
      open_interest: openInterest || marketMap?.[symbol]?.open_interest,
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
      Object.assign(config, get24hChange(ticker.open, ticker.close));
    }
    return config;
  }, [info, symbol, ticker, markPrice, indexPrice, openInterest, marketMap]);

  return value as API.MarketInfo & { change?: number; "24h_change"?: number };
};

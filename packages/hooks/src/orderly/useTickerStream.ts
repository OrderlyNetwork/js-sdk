import { useEffect, useState } from "react";
import { useQuery } from "../useQuery";
import { useWebSocketClient } from "../useWebSocketClient";
import { useObservable } from "rxjs-hooks";
import { API } from "@orderly.network/types";
import { combineLatestWith, map, startWith } from "rxjs/operators";
import { Decimal } from "@orderly.network/utils";

export const useTickerStream = (symbol: string) => {
  if (!symbol) {
    throw new Error("useFuturesForSymbol requires a symbol");
  }
  const { data: info } = useQuery<API.MarketInfo>(`/public/futures/${symbol}`);
  const ws = useWebSocketClient();

  const ticker = useObservable<any, any>(
    (_, input$) =>
      input$.pipe(
        map(([config]) => config),
        combineLatestWith(ws.observe(`${symbol}@ticker`).pipe(startWith({}))),
        map(([config, ticker]: [API.MarketInfoExt, any]) => {
          if (!config) return config;
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
        })
      ),
    null,
    [info]
  );

  // return useQuery(`/public/futures/${symbol}`);
  return ticker;
};

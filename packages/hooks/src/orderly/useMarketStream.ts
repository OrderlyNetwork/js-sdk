import { useQuery } from "../useQuery";

import { type API } from "@orderly.network/types";
import { useWebSocketClient } from "../useWebSocketClient";
import { useObservable } from "rxjs-hooks";
import { combineLatestWith, map } from "rxjs/operators";
import { Decimal } from "@orderly.network/utils";

export const useMarketStream = (symbol: string) => {
  if (!symbol) {
    throw new Error("symbol is required");
  }
  const { data: info } = useQuery<API.MarketInfo>(`/public/futures/${symbol}`);
  const ws = useWebSocketClient();

  const ticker = useObservable<
    API.MarketInfo | null,
    [API.MarketInfo | undefined]
  >(
    (_, input$) =>
      input$.pipe(
        map(([config]) => config),
        combineLatestWith(ws.observe(`${symbol}@ticker`)),
        map(([config, ticker]: [API.MarketInfo, any]) => {
          // console.log(config, ticker);
          return {
            ...config,
            ["24h_close"]: ticker.close,
            ["24h_open"]: ticker.open,
            ["24h_volumn"]: ticker.volume,
            change: new Decimal(ticker.close)
              .minus(ticker.open)
              .div(ticker.open)
              .toNumber(),
          };
        })
      ),
    null,
    [info]
  );

  return ticker;
};

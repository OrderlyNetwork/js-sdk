import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { pick, pathOr, defaultTo, last, compose, head, set } from "ramda";
import useConstant from "use-constant";
import { useTickerStream } from "./useTickerStream";
import { useMarkPrice } from "./useMarkPrice";
import { useWS } from "../useWS";

export type OrderBookItem = number[];

export type OrderbookData = {
  asks: OrderBookItem[];
  bids: OrderBookItem[];
};

const asksFirstPath = compose(defaultTo(0), head, last, pathOr([], ["asks"]));
// const asksFirstPath = pathOr(0, ["asks", 0,]);
const bidsFirstPath = pathOr(0, ["bids", 0, 0]);

const paddingFn = (len: number) =>
  Array(len).fill([Number.NaN, Number.NaN, Number.NaN] as OrderBookItem);

const asksSortFn = (a: OrderBookItem, b: OrderBookItem) => a[0] - b[0];

const bidsSortFn = (a: OrderBookItem, b: OrderBookItem) => b[0] - a[0];

// const commonSortFn = (a: OrderBookItem, b: OrderBookItem) => b[0] - a[0];

const reduceItems = (depth: number, level: number, data: OrderBookItem[]) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  const result: OrderBookItem[] = [];

  for (let i = 0; i < data.length; i++) {
    const [price, quantity] = data[i];
    if (isNaN(price) || isNaN(quantity)) continue;
    result.push([
      price,
      quantity,
      quantity + (result.length > 0 ? result[result.length - 1][2] : 0),
    ]);
    // if the total is greater than the level, break
    if (i + 1 >= level) {
      break;
    }
  }

  return result;
};

/**
 * @name reduceOrderbook
 * @param depth
 * @param level
 * @param data
 */
export const reduceOrderbook = (
  depth: number,
  level: number,
  data: OrderbookData
): OrderbookData => {
  const asks = reduceItems(depth, level, data.asks).reverse();

  const bids = reduceItems(depth, level, data.bids);
  return {
    asks:
      asks.length < level ? paddingFn(level - asks.length).concat(asks) : asks,
    bids:
      bids.length < level ? bids.concat(paddingFn(level - bids.length)) : bids,
  };
};

const mergeItems = (data: OrderBookItem[], update: OrderBookItem[]) => {
  // let index = -1;
  if (data.length === 0) return update;
  while (update.length > 0) {
    const item = update.shift();
    if (item) {
      const [price, quantity] = item;
      if (price < data[0][0] && quantity > 0) {
        data.unshift(item);

        continue;
      }

      const index = data.findIndex(([p], index) => p === price);
      if (index === -1) {
        data.push(item);
      } else {
        if (quantity === 0) {
          data.splice(index, 1);

          continue;
        }
        data[index] = item;
      }
    }
  }

  return data;
};

export const mergeOrderbook = (data: OrderbookData, update: OrderbookData) => {
  return {
    asks: mergeItems(data.asks, update.asks).sort(asksSortFn),
    bids: mergeItems(data.bids, update.bids).sort(bidsSortFn),
  };
};

export type OrderbookOptions = {
  level?: number;
};

/**
 * @name useOrderbookStream
 * @description React hook that returns the current orderbook for a given market
 */
export const useOrderbookStream = (
  symbol: string,
  initial: OrderbookData = { asks: [], bids: [] },
  options?: OrderbookOptions
) => {
  if (!symbol) {
    throw new Error("useOrderbookStream requires a symbol");
  }

  const [requestData, setRequestData] = useState<OrderbookData | null>(null);
  const [data, setData] = useState<OrderbookData>(initial);
  const [isLoading, setIsLoading] = useState(true);
  const [depth, setDepth] = useState(0.001);
  const [level, setLevel] = useState(() => options?.level ?? 10);

  // console.log("useOrderbookStream -----------", data);

  const ws = useWS();

  const ticker = useTickerStream(symbol);

  // const orderbookRequest =

  useEffect(() => {
    ws.onceSubscribe(
      {
        event: "request",
        params: {
          type: "orderbook",
          symbol: symbol,
        },
      },
      {
        onMessage: (message: any) => {
          console.log("orderbook request message", message);
          if (!!message) {
            const reduceOrderbookData = reduceOrderbook(depth, level, message);
            setRequestData(reduceOrderbookData);
            setData(reduceOrderbookData);
          }
          setIsLoading(false);
        },
      }
    );

    return () => {
      setRequestData(null);
    };
  }, [symbol]);

  // const {data:markPrices} = useMarkPricesStream();

  const { data: markPrice } = useMarkPrice(symbol);

  useEffect(() => {
    if (!requestData) return;

    const subscription = ws.subscribe(
      {
        event: "subscribe",
        topic: `${symbol}@orderbookupdate`,
      },
      {
        onMessage: (message: any) => {
          // console.log("orderbook update message", message);

          setData((data) => {
            const mergedData =
              !message.asks && !message.bids
                ? data
                : mergeOrderbook(data, message);

            const reducedData = reduceOrderbook(depth, level, mergedData);
            return reducedData;
          });
        },
      }
    );

    return () => {
      subscription?.(); //unsubscribe
    };
  }, [symbol, requestData]);

  const onDepthChange = useCallback((depth: number) => {
    console.log("Orderbook depth has changed:", depth);
    // orderbookOptions$.next({
    //   ...orderbookOptions$.value,
    //   depth,
    //   // level,
    // });
  }, []);

  // markPrice, lastPrice

  const middlePrice = useMemo(() => {
    let asksFrist = 0,
      bidsFirst = 0;

    if (data.asks.length > 0) {
      asksFrist = data.asks[data.asks.length - 1][0];
    }

    if (data.bids.length > 0) {
      bidsFirst = data.bids[0][0];
    }

    if (isNaN(asksFrist) || isNaN(bidsFirst) || !ticker) return 0;

    return [asksFrist, bidsFirst, ticker["24h_close"]].sort()[1];
  }, [ticker, data]);

  return [
    { ...data, markPrice, middlePrice },
    { onDepthChange, depth, isLoading },
  ];
};

export type useOrderbookStreamReturn = ReturnType<typeof useOrderbookStream>;

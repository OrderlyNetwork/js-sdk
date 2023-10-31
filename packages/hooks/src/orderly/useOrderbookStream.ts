import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTickerStream } from "./useTickerStream";
import { useMarkPrice } from "./useMarkPrice";
import { useWS } from "../useWS";
import { useEventEmitter } from "../useEventEmitter";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { Decimal } from "@orderly.network/utils";

export type OrderBookItem = number[];

export type OrderbookData = {
  asks: OrderBookItem[];
  bids: OrderBookItem[];
};

const paddingFn = (len: number) =>
  Array(len).fill([Number.NaN, Number.NaN, Number.NaN] as OrderBookItem);

const asksSortFn = (a: OrderBookItem, b: OrderBookItem) => a[0] - b[0];

const bidsSortFn = (a: OrderBookItem, b: OrderBookItem) => b[0] - a[0];

// const commonSortFn = (a: OrderBookItem, b: OrderBookItem) => b[0] - a[0];

const reduceItems = (
  depth: number | undefined,
  level: number,
  data: OrderBookItem[],
  asks = false
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  let newData = [...data];
  const result: OrderBookItem[] = [];

  //

  if (typeof depth !== "undefined") {
    const prices = new Map<number, number[]>();
    for (let i = 0; i < data.length; i++) {
      const [price, quantity] = data[i];
      if (isNaN(price) || isNaN(quantity)) continue;
      let priceKey;

      if (asks) {
        priceKey = new Decimal(Math.ceil(price / depth)).mul(depth).toNumber();
      } else {
        priceKey = new Decimal(Math.floor(price / depth)).mul(depth).toNumber();
      }

      //

      if (prices.has(priceKey)) {
        const item = prices.get(priceKey)!;
        const itemPrice = new Decimal(item[1]).add(quantity).toNumber();

        // prices.push([price, quantity]);
        prices.set(priceKey, [priceKey, itemPrice]);
      } else {
        prices.set(priceKey, [priceKey, quantity]);
      }
    }

    newData = Array.from(prices.values());
  }

  for (let i = 0; i < newData.length; i++) {
    const [price, quantity] = newData[i];
    if (isNaN(price) || isNaN(quantity)) continue;

    const newQuantity = new Decimal(quantity)
      .add(result.length > 0 ? result[result.length - 1][2] : 0)
      .toNumber();

    result.push([price, quantity, newQuantity]);
    // if the total is greater than the level, break
    //TODO:
    // if (i + 1 >= level) {
    //   break;
    // }
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
  depth: number | undefined,
  level: number,
  data: OrderbookData
): OrderbookData => {
  const asks = reduceItems(depth, level, data.asks, true).reverse();

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
  //
  if (data.length === 0) return update;

  data = data.filter(([price]) => !isNaN(price));

  while (update.length > 0) {
    const item = update.shift();
    //
    if (item) {
      const [price, quantity] = item;

      const index = data.findIndex(([p], index) => p === price);
      //
      if (index === -1) {
        if (quantity === 0) continue;
        data.push(item);
      } else {
        if (quantity === 0) {
          data.splice(index, 1);
        } else {
          data[index] = item;
        }
      }
    }
  }

  return data;
};

export const mergeOrderbook = (data: OrderbookData, update: OrderbookData) => {
  const asks = mergeItems(data.asks, update.asks).sort(asksSortFn);
  const bids = mergeItems(data.bids, update.bids).sort(bidsSortFn);

  if (asks.length > 0) {
    console.log("find first", asks[0], bids[0]);
    const firstPrice = asks[0][0];
    const index = bids.findIndex(item => item[0] < firstPrice);
    if (index > 0) {
      bids.splice(0,index+1);
    }
  }
  return {
    asks: asks,
    bids: bids,
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
  const [level, setLevel] = useState(() => options?.level ?? 10);
  const config = useSymbolsInfo()[symbol];

  const [depth, setDepth] = useState<number | undefined>();

  const depths = useMemo(() => {
    const tick = config("quote_tick");

    //

    return [tick, tick * 10, tick * 100, tick * 1000];
  }, [config("quote_tick")]);

  useEffect(() => {
    setDepth(config("quote_tick"));
  }, [config("quote_tick")]);

  const ws = useWS();

  const ticker = useTickerStream(symbol);

  const eventEmitter = useEventEmitter();

  // const orderbookRequest =

  useEffect(() => {
    ws.onceSubscribe(
      {
        event: "request",
        id: `${symbol}@orderbook`,
        params: {
          type: "orderbook",
          symbol: symbol,
        },
      },
      {
        onMessage: (message: any) => {
          //
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
  }, [symbol, depth]);

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
          //

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

  const onItemClick = useCallback((item: OrderBookItem) => {
    eventEmitter.emit("orderbook:item:click", item);
  }, []);

  const onDepthChange = useCallback((depth: number) => {
    //
    setDepth(() => depth);
  }, []);

  // markPrice, lastPrice
  const prevMiddlePrice = useRef<number>(0);

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

  useEffect(() => {
    prevMiddlePrice.current = middlePrice;
  }, [middlePrice]);

  return [
    {
      asks: data.asks.slice(-level),
      bids: data.bids.slice(0, level),
      markPrice: markPrice,
      middlePrice: [prevMiddlePrice.current, middlePrice],
    },
    { onDepthChange, depth, allDepths: depths, isLoading, onItemClick },
  ];
};

export type useOrderbookStreamReturn = ReturnType<typeof useOrderbookStream>;

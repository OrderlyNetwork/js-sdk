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

  // console.log("depth:::::", depth);

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

      // console.log("priceKey:::", priceKey);

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
  // console.log("mergeItems", data, update);
  if (data.length === 0) return update;

  data = data.filter(([price]) => !isNaN(price));

  while (update.length > 0) {
    const item = update.shift();
    // console.log("item", item);
    if (item) {
      const [price, quantity] = item;

      // if (price < data[0][0] && quantity > 0) {
      //   console.log("continue", price, data[0][0], quantity);

      //   data.unshift(item);

      //   continue;
      // }

      const index = data.findIndex(([p], index) => p === price);
      // console.log(index);
      if (index === -1) {
        data.push(item);
      } else {
        if (quantity === 0) {
          data.splice(index, 1);

          continue;
        } else {
          data[index] = item;
        }
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
  const [level, setLevel] = useState(() => options?.level ?? 10);
  const config = useSymbolsInfo()[symbol];

  const [depth, setDepth] = useState<number | undefined>();

  const depths = useMemo(() => {
    const tick = config("quote_tick");

    // console.log(tick);

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
          // console.log("orderbook request message", message);
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

  const onItemClick = useCallback((item: OrderBookItem) => {
    eventEmitter.emit("orderbook:item:click", item);
  }, []);

  const onDepthChange = useCallback((depth: number) => {
    // console.log("Orderbook depth has changed:", depth);
    setDepth(() => depth);
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
    { onDepthChange, depth, allDepths: depths, isLoading, onItemClick },
  ];
};

export type useOrderbookStreamReturn = ReturnType<typeof useOrderbookStream>;

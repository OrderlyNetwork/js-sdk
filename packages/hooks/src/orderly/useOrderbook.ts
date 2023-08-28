import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BehaviorSubject, Subscription } from "rxjs";
import { startWith, map, scan, withLatestFrom, tap } from "rxjs/operators";
import { merge } from "rxjs";
import { useWebSocketClient } from "../useWebSocketClient";
import { pick } from "ramda";
import useConstant from "use-constant";

export type OrderBookItem = number[];

export type OrderbookData = {
  asks: OrderBookItem[];
  bids: OrderBookItem[];
};

const paddingFn = (len: number) =>
  Array(len).fill([Number.NaN, Number.NaN, Number.NaN] as OrderBookItem);

const asksSortFn = (a: OrderBookItem, b: OrderBookItem) => a[0] - b[0];

const bidsSortFn = (a: OrderBookItem, b: OrderBookItem) => b[0] - a[0];

const commonSortFn = (a: OrderBookItem, b: OrderBookItem) => b[0] - a[0];

const reduceItems = (depth: number, level: number, data: OrderBookItem[]) => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  const result: OrderBookItem[] = [];

  for (let i = 0; i < data.length; i++) {
    const [price, quantity] = data[i];
    result.push([price, quantity, quantity + (i > 0 ? result[i - 1][2] : 0)]);
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
 * @name useOrderbook
 * @description React hook that returns the current orderbook for a given market
 */
export const useOrderbook = (
  symbol: string,
  initial: OrderbookData = { asks: [], bids: [] },
  options?: OrderbookOptions
) => {
  const [data, setData] = useState<OrderbookData>(initial);
  const [depth, setDepth] = useState(0.001);
  const [level, setLevel] = useState(() => options?.level ?? 10);

  const ws = useWebSocketClient();

  const lastSubscriberRef = useRef<Subscription | undefined>();

  const orderbookRequest$ = useMemo(() => {
    return ws.observe(
      {
        event: "request",
        params: {
          type: "orderbook",
          symbol: symbol,
        },
      },
      undefined,
      (message: any) => message.event === "request"
    );
  }, [symbol]);

  const orderbookUpdate$ = useMemo(() => {
    return ws
      .observe(`${symbol}@orderbookupdate`, () => ({
        event: "subscribe",
        topic: `${symbol}@orderbookupdate`,
      }))
      .pipe(
        startWith({ asks: [], bids: [] })
        // filter((message: any) => !!message.success)
      );
  }, [symbol]);

  const orderbookOptions$ = useConstant(() => {
    return new BehaviorSubject({
      depth: 0.001,
      level: 10,
    });
  });

  useEffect(() => {
    if (lastSubscriberRef.current) {
      lastSubscriberRef.current.unsubscribe();
    }

    lastSubscriberRef.current = merge(orderbookRequest$, orderbookUpdate$)
      .pipe(
        // tap((data) => console.log(data)),
        map<any, OrderbookData>(
          (data) => pick(["asks", "bids"], data) as OrderbookData
        ),
        tap((data) => console.log(data)),
        scan<OrderbookData, OrderbookData>((acc, curr) => {
          if (!acc.asks && !acc.bids) {
            return curr;
          }

          return mergeOrderbook(acc, curr);
        }),
        map((data) => reduceOrderbook(depth, level, data))
      )
      .subscribe((data) => {
        setData(data);
      });

    () => {
      return lastSubscriberRef.current?.unsubscribe();
    };
  }, [orderbookRequest$, orderbookUpdate$]);

  const onDepthChange = useCallback((depth: number) => {
    console.log("Orderbook depth has changed:", depth);
    orderbookOptions$.next({
      ...orderbookOptions$.value,
      depth,
      // level,
    });
  }, []);

  return [data, { onDepthChange, depth }];
};

export type useOrderbookReturn = ReturnType<typeof useOrderbook>;

import { useWebSocketClient } from "../useWebsocketClient";
import { useEffect, useMemo, useRef, useState } from "react";
import { Subscription } from "rxjs";
import { filter, startWith, withLatestFrom } from "rxjs/operators";

/**
 * @name useOrderbook
 * @description React hook that returns the current orderbook for a given market
 */
export const useOrderbook = <T>(pair: string, initial?: T) => {
  const [data, setData] = useState<T | null>(initial ?? null);
  const ws = useWebSocketClient();

  const lastSubscriberRef = useRef<Subscription | undefined>();

  const orderbookRequest = useMemo(() => {
    return ws.observe(
      {
        event: "request",
        params: {
          type: "orderbook",
          symbol: pair,
        },
      },
      undefined,
      (message: any) => message.event === "request"
    );
  }, [pair]);

  const orderbookUpdate = useMemo(() => {
    return ws
      .observe(`${pair}@orderbookupdate`, () => ({
        event: "subscribe",
        topic: `${pair}@orderbookupdate`,
      }))
      .pipe(
        startWith({ success: true, asks: [], bids: [] }),
        filter((message: any) => !!message.success)
      );
  }, [pair]);

  useEffect(() => {
    if (lastSubscriberRef.current) {
      lastSubscriberRef.current.unsubscribe();
    }
    lastSubscriberRef.current = orderbookRequest
      .pipe(withLatestFrom(orderbookUpdate))
      .subscribe((data) => {
        console.log(data);
      });

    () => {
      return lastSubscriberRef.current?.unsubscribe();
    };
  }, [orderbookRequest, orderbookUpdate]);

  console.log(data);

  return data;
};

import { useRef } from "react";
import useSWRSubscription from "swr/subscription";
import { useWS } from "../useWS";

export const useIndexPrice = (symbol: string | null) => {
  // WARNING: force change perp to spot, because there is no perp now
  const spotSymbol = symbol?.replace("PERP", "SPOT") ?? null;

  const symbolRef = useRef<string | null>(spotSymbol);
  symbolRef.current = spotSymbol;

  const ws = useWS();
  // A null key suspends the SWR subscription, letting consumers gate the
  // index stream without unmounting the hook.
  return useSWRSubscription(
    spotSymbol ? `${spotSymbol}@indexprice` : null,
    (key, { next }) => {
      const unsubscribe = ws.subscribe(`${spotSymbol}@indexprice`, {
        onMessage: (message: any) => {
          // when current symbol is not the same as the ws symbol, skip update data and auto unsubscribe old symbol ws
          if (message.symbol !== symbolRef.current) {
            unsubscribe?.();
            return;
          }
          next(null, message.price);
        },
      });

      return () => {
        unsubscribe?.();
      };
    },
  );
};

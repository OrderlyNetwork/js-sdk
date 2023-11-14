import { useWS } from "../useWS";
import useSWRSubscription from "swr/subscription";

export const useIndexPrice = (symbol: string) => {
  // WARNING: force change perp to spot, because there is no perp now
  symbol = symbol.replace("PERP", "SPOT");
  const ws = useWS();
  return useSWRSubscription(`${symbol}@indexprice`, (key, { next }) => {
    const unsubscribe = ws.subscribe(`${symbol}@indexprice`, {
      onMessage: (message: any) => {
        next(null, message.price);
      },
    });

    return () => {
      unsubscribe?.();
    };
  });
};

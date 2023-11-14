import { useWS } from "../useWS";
import useSWRSubscription from "swr/subscription";

export const useMarkPrice = (symbol: string) => {
  const ws = useWS();
  return useSWRSubscription(`${symbol}@markprice`, (key, { next }) => {
    const unsubscribe = ws.subscribe(`${symbol}@markprice`, {
      onMessage: (message: any) => {
        next(null, message.price);
      },
    });

    return () => {
      unsubscribe?.();
    };
  });
};

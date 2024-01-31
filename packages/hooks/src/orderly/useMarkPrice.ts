import { useWS } from "../useWS";
import useSWRSubscription from "swr/subscription";

export const useMarkPrice = (symbol: string) => {
  const ws = useWS();

  return useSWRSubscription(`${symbol}@markprice`, (key, { next }) => {
    const unsubscribe = ws.subscribe(`${symbol}@markprice`, {
      onMessage: (message: any) => {
        // console.log(message);
        next(null, message.price);
      },
    });

    return () => {
      // console.log("_____________________ unsubscribe _________ ", symbol);
      unsubscribe?.();
    };
  });
};

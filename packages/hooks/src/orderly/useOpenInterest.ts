import { useWS } from "../useWS";
import useSWRSubscription from "swr/subscription";

export const useOpenInterest = (symbol: string) => {
  const ws = useWS();
  return useSWRSubscription(`${symbol}@openinterest`, (key, { next }) => {
    const unsubscribe = ws.subscribe(`${symbol}@openinterest`, {
      onMessage: (message: any) => {
        next(null, message.openInterest);
      },
    });

    return () => {
      unsubscribe?.();
    };
  });
};

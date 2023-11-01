import useSWRSubscription from "swr/subscription";
import { useWS } from "../useWS";

export const useSettleSubscription = (options?: {
  onMessage?: (data: any) => void;
}) => {
  const ws = useWS();

  return useSWRSubscription("settle", (_, { next }) => {
    const unsubscribe = ws.privateSubscribe(
      {
        id: "settle",
        event: "subscribe",
        topic: "settle",
        ts: Date.now(),
      },
      {
        onMessage: (data: any) => {
          //
          options?.onMessage?.(data);
          next(data);
        },
      }
    );

    return () => unsubscribe();
  });
};

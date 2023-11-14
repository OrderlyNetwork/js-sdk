import useSWRSubscription from "swr/subscription";
import { useWS } from "../useWS";

export const useMarkPricesStream = () => {
  const ws = useWS();
  return useSWRSubscription("markPrices", (key, { next }) => {
    const unsubscribe = ws.subscribe(
      // { event: "subscribe", topic: "markprices" },
      "markprices",
      {
        onMessage: (message: any) => {
          const data: Record<string, number> = Object.create(null);

          for (let index = 0; index < message.length; index++) {
            const element = message[index];
            data[element.symbol] = element.price;
          }

          next(null, data);
        },
        // onUnsubscribe: () => {
        //   return "markprices";
        // },
        onError: (error: any) => {},
      }
    );

    return () => {
      unsubscribe?.();
    };
  });
};

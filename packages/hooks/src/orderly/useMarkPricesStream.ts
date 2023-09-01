import useSWRSubscription from "swr/subscription";

import { useWS } from "../useWS";
import { useState } from "react";

export const useMarkPricesStream = () => {
  const ws = useWS();
  // const markPrice$ = useMarkPricesSubject();
  // const [isLoading, setIsLoading] = useState(true);

  return useSWRSubscription("markPrices", (key, { next }) => {
    const unsubscribe = ws.subscription(
      { event: "subscribe", topic: "markprices" },
      {
        onMessage: (message: any) => {
          // if (isLoading) {
          //   setIsLoading(false);
          // }
          const data: Record<string, number> = Object.create(null);

          for (let index = 0; index < message.length; index++) {
            const element = message[index];
            data[element.symbol] = element.price;
          }

          next(null, data);
        },
        onUnsubscribe: () => {
          return "markprices";
        },
        onError: (error: any) => {
          console.log("error", error);
        },
      }
    );

    return () => {
      //unsubscribe
      console.log("unsubscribe!!!!!!!");
      console.log("unsubscribe", unsubscribe);
      unsubscribe?.();
    };
  });

  // return [data, { isLoading }];
};

import { useEffect, useState } from "react";
import { useWS } from "../useWS";
// import useSWRSubscription from "swr/subscription";

export const useMarkPrice = (symbol: string) => {
  const ws = useWS();
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const unsubscribe = ws.subscribe(`${symbol}@markprice`, {
      onMessage: (message: any) => {
        setPrice(message.price);
      },
    });

    return () => {
      unsubscribe?.();
    };
  }, [symbol]);

  // return useSWRSubscription(`${symbol}@markprice`, (key, { next }) => {
  //   const unsubscribe = ws.subscribe(`${symbol}@markprice`, {
  //     onMessage: (message: any) => {
  //       next(null, message.price);
  //     },
  //   });

  //   return () => {
  //     // console.log("_____________________ unsubscribe _________ ", symbol);
  //     unsubscribe?.();
  //   };
  // });

  return { data: price };
};

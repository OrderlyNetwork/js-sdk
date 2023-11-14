import { useWS } from "../useWS";
import useSWRSubscription from "swr/subscription";

export const useIndexPrice = (symbol: string) => {
  // WARNING: 这里是需要强行把perp改为spot，因为现在是没有perp的
  symbol = symbol.replace("PERP", "SPOT");
  const ws = useWS();
  return useSWRSubscription(`${symbol}@indexprice`, (key, { next }) => {
    const unsubscribe = ws.subscribe(`${symbol}@indexprice`, {
      onMessage: (message: any) => {
        //
        next(null, message.price);
      },
    });

    return () => {
      unsubscribe?.();
    };
  });
};

import { useWS } from "../useWS";
import useSWRSubscription from "swr/subscription";

export const useBalance = () => {
  const ws = useWS();
  const { data } = useSWRSubscription("balance", (_, { next }) => {
    const unsubscribe = ws.privateSubscribe("balance", {
      onMessage: (data: any) => {
        console.log(data);
      },
    });
    return () => unsubscribe();
  });

  return data;
};

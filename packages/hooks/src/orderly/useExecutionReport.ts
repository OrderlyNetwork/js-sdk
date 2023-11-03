import useSWRSubscription from "swr/subscription";
import { useWS } from "../useWS";

export const useExecutionReport = (options?: {
  onMessage?: (data: any) => void;
}) => {
  const ws = useWS();
  const { data } = useSWRSubscription("executionreport", (_, { next }) => {
    const unsubscribe = ws.privateSubscribe({
      id: "executionreport",
      event: "subscribe",
      topic: "executionreport",
      ts: Date.now(),
    }, {
      onMessage: (data: any) => {
        //
        options?.onMessage?.(data);
        next(data);
      },
    });
    return () => unsubscribe();
  });

  return data;
};

import { API } from "@orderly.network/types";
import { usePrivateQuery } from "../usePrivateQuery";
import { useEffect, useMemo } from "react";
import { useWS } from "../useWS";
import useSWRSubscription from "swr/subscription";
import { prop } from "ramda";

export const useHoldingStream = () => {
  const ws = useWS();

  const { data, isLoading, mutate } = usePrivateQuery<API.Holding[]>(
    "/v1/client/holding",
    {
      formatter: (data) => {
        return data.holding;
      },
    }
  );

  const usdc = useMemo(() => {
    const usdc = data?.find((item) => item.token === "USDC");
    return usdc;
  }, [data]);

  useSWRSubscription("holding", (_, { next }) => {
    const unsubscribe = ws.privateSubscribe(
      {
        id: "balance",
        event: "subscribe",
        topic: "balance",
        ts: Date.now(),
      },
      {
        onMessage: (data: any) => {
          const holding = data?.balances ?? ({} as Record<string, any>);

          if (holding) {
            mutate((prevData) => {
              return prevData?.map((item) => {
                const token = holding[item.token];
                return {
                  ...item,
                  frozen: token.frozen,
                  holding: token.holding,
                };
              });
            });

            next(holding);
          }
        },
      }
    );

    return () => unsubscribe();
  });

  return {
    data,
    usdc,
    isLoading,
  };
};

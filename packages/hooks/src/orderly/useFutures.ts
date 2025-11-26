import { useMemo } from "react";
import { API } from "@orderly.network/types";
import { useOrderlyContext } from "../orderlyContext";
import { useQuery } from "../useQuery";

/**
 * get symbol list
 */
export const useFutures = () => {
  const { dataAdapter } = useOrderlyContext();

  const { data } = useQuery<API.MarketInfo[]>("/v1/public/futures", {
    // 24 hours
    focusThrottleInterval: 1000 * 60 * 60 * 24,
    revalidateOnFocus: true,
    // 24 hours
    dedupingInterval: 1000 * 60 * 60 * 24,
    // onSuccess will not be called, because /v1/public/futures trigger multiple times
    // onSuccess(data: API.MarketInfo[]) {
    // if (!data || !data?.length) {
    //   return [];
    // }
    // updateMarket(data as API.MarketInfoExt[]);
    // },
  });

  const futures = useMemo(() => {
    if (Array.isArray(data)) {
      return typeof dataAdapter?.symbolList === "function"
        ? dataAdapter.symbolList(data as API.MarketInfoExt[])
        : data;
    }

    return [];
  }, [data, dataAdapter?.symbolList]);

  return {
    data: futures,
  };
};

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "../useQuery";
import { useWS } from "../useWS";

interface MarketInfo {}

// api: /public/futures
export const useFutures = () => {
  const { data, isLoading, error } = useQuery<MarketInfo[]>(
    `/v1/public/futures`,
    {
      revalidateOnFocus: false,
    },
  );

  const [sortedData, setSortedData] = useState(data);

  const ws = useWS();

  useEffect(() => {
    // const sub = ws
    //   .observe<WSMessage.Ticker>(`tickers`)
    //   .subscribe((value: any) => {
    //
    //     // setData(value);
    //   });
    // return () => {
    //   sub.unsubscribe();
    // };
  }, []);

  useEffect(() => {
    if (data) {
      const sortedData = data.sort((a, b) => {
        return 0;
      });
      setSortedData(sortedData);
    }
  }, [data]);

  const sortBy = useCallback((key: string) => {}, [data]);

  const filterBy = useCallback((key: string) => {}, [data]);

  return {
    data: sortedData,
    sortBy,
    filterBy,
    isLoading,
    error,
  };
};

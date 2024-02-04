import { useContext, useMemo } from "react";
import { OrderlyContext, useQuery, useSWR } from ".";

export const usePreLoadData = () => {
  const { configStore } = useContext(OrderlyContext);

  // const { error: swapSupportError, data: swapSupportData } = useSWR(
  //   `${configStore.get("swapSupportApiUrl")}/swap_support`,
  //   (url) => fetch(url).then((res) => res.json()),
  //   {
  //     revalidateOnFocus: false,
  //   }
  // );

  const { error: tokenError, data: tokenData } = useQuery(
    "https://api-evm.orderly.org/v1/public/token",
    {
      revalidateOnFocus: false,
    }
  );

  const isDone = useMemo(() => {
    return !!tokenData;
  }, [tokenData]);

  return {
    error: tokenError,
    done: isDone,
  };
};

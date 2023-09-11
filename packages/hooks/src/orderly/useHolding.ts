import { API } from "@orderly.network/types";
import { usePrivateQuery } from "../usePrivateQuery";
import { useMemo } from "react";

export const useHolding = () => {
  const { data, isLoading } = usePrivateQuery<API.Holding[]>(
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

  return {
    data,
    usdc,
    isLoading,
  };
};

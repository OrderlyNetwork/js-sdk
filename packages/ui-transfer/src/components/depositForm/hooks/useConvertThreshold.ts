import { useQuery } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

export const useConvertThreshold = () => {
  const { data, error, isLoading } = useQuery<API.ConvertThreshold>(
    "/v1/public/auto_convert_threshold",
    {
      revalidateOnFocus: true,
      errorRetryCount: 3,
    },
  );

  return {
    ltv_threshold: data?.ltv_threshold,
    negative_usdc_threshold: data?.negative_usdc_threshold,
    isLoading,
    error,
  };
};

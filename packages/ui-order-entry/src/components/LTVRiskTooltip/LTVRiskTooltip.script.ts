import { useQuery } from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";

const useConvertThreshold = () => {
  const { data, error, isLoading } = useQuery<API.ConvertThreshold>(
    "/v1/public/auto_convert_threshold",
    { errorRetryCount: 3 },
  );
  return {
    ltv_threshold: data?.ltv_threshold,
    negative_usdc_threshold: data?.negative_usdc_threshold,
    isLoading,
    error,
  } as const;
};

export const useLTVTooltipScript = () => {
  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isThresholdLoading,
  } = useConvertThreshold();
  return {
    ltv_threshold,
    negative_usdc_threshold,
    isThresholdLoading,
  };
};

export type LTVTooltipScriptReturn = ReturnType<typeof useLTVTooltipScript>;

import { useMemo } from "react";
import { useQuery } from "@kodiak-finance/orderly-hooks";
import type { API } from "@kodiak-finance/orderly-types";
import { Decimal } from "@kodiak-finance/orderly-utils";

export const useLtvScript = () => {
  const { data, error, isLoading } = useQuery<API.ConvertThreshold>(
    "/v1/public/auto_convert_threshold",
    {
      errorRetryCount: 3,
      revalidateOnFocus: false,
    },
  );
  const ltvThreshold = useMemo(() => {
    if (!data || isLoading) {
      return "-";
    }
    return `${new Decimal(data.ltv_threshold).mul(100).toNumber()}%`;
  }, []);
  return {
    ltv_threshold: ltvThreshold,
    negative_usdc_threshold: data?.negative_usdc_threshold,
    isLoading,
    error,
  } as const;
};

export type LtvScriptReturns = ReturnType<typeof useLtvScript>;

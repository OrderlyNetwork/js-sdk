import {
  DEFAULT_USDC_BORROW_LIMIT,
  normalizeUSDCBorrowLimit,
  useQuery,
} from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

export const useConvertThreshold = () => {
  const { data, error, isLoading } = useQuery<API.ConvertThreshold>(
    "/v1/public/auto_convert_threshold",
    { errorRetryCount: 3 },
  );

  return {
    ltv_threshold: new Decimal(data?.ltv_threshold ?? 0).mul(100).toNumber(),
    negative_usdc_threshold: data?.negative_usdc_threshold,
    usdcBorrowLimit: error
      ? DEFAULT_USDC_BORROW_LIMIT
      : normalizeUSDCBorrowLimit(data?.negative_usdc_threshold),
    isLoading,
    error,
  } as const;
};

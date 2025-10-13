import type { API } from "@kodiak-finance/orderly-types";
import { SDKError } from "@kodiak-finance/orderly-types";
import { useQuery } from "../useQuery";

export const useFundingDetails = (symbol: string) => {
  if (!symbol) {
    throw new SDKError("symbol is required");
  }
  return useQuery<API.FundingDetails>(`/v1/public/info/${symbol}`, {
    errorRetryCount: 3,
    revalidateOnFocus: false,
  });
};

import type { API } from "@veltodefi/types";
import { SDKError } from "@veltodefi/types";
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

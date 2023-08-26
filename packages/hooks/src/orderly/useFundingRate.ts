import { API } from "@orderly/types";
import { useQuery } from "../useQuery";

export const useFundingRate = (symbol: string) => {
  return useQuery<API.FundingRate>(`/public/funding_rate/${symbol}`, {
    fallbackData: {
      est_funding_rate: 0,
      next_funing_time: 0,
    },
  });
};

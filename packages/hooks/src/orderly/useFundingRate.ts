import { useQuery } from "../useQuery";

export type FundingRate = {
  symbol: string;
  est_funding_rate: number;
  est_funding_rate_timestamp: number;
  last_funding_rate: number;
  last_funding_rate_timestamp: number;
  next_funding_time: number;
  sum_unitary_funding: number;
};
export const useFundingRate = (symbol: string) => {
  return useQuery<FundingRate>(`/public/funding_rate/${symbol}`, {
    fallbackData: {
      est_funding_rate: 0,
      next_funing_time: 0,
    },
  });
};

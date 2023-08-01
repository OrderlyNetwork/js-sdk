import { useQuery } from "../useQuery";

export interface FundingRate {
  symbol: string;
  est_funding_rate: number;
  est_funding_rate_timestamp: number;
  last_funding_rate: number;
  last_funding_rate_timestamp: number;
  next_funding_time: number;
  sum_unitary_funding: number;
}

/**
 * FundingRate
 * @param symbol
 */
export const useFundingRateBySymbol = (symbol: string) => {
  if (!symbol) {
    throw new Error("symbol is required");
  }
  return useQuery<FundingRate>(`/public/funding_rate/${symbol}`);
};

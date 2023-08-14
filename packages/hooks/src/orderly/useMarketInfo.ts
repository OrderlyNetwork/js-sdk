import { useQuery } from "../useQuery";

export type MarketInfo = {
  symbol:              string;
  index_price:         number;
  mark_price:          number;
  sum_unitary_funding: number;
  est_funding_rate:    number;
  last_funding_rate:   number;
  next_funding_time:   number;
  open_interest:       string;
  "24h_open":          number;
  "24h_close":         number;
  "24h_high":          number;
  "24h_low":           number;
  "24h_volumn":        number;
  "24h_amount":        number;
}

export const useMarketInfo = (symbol: string) => {
  if (!symbol) {
    throw new Error("symbol is required");
  }
  return useQuery<MarketInfo>(`/public/futures/${symbol}`);
};

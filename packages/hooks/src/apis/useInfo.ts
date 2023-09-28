import { useQuery } from "../useQuery";

export interface Info {
  // token name
  symbol: string;
  quote_min: number;
  quote_max: number;
  quote_tick: number;
  base_min: number;
  base_max: number;
  base_tick: number;
  min_notional: number;
  price_range: number;
  created_time: number;
  updated_time: number;
}

/**
 * useInfo
 * @returns
 */
export const useInfo = () => {
  return useQuery<Info[]>("/v1/public/info", {
    // refreshInterval: 1000 * 60 * 60 * 24,
  });
};

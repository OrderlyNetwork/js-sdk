import { useQuery } from "../useQuery";

import {type API} from "@orderly/core";

export const useMarketInfo = (symbol: string) => {
  if (!symbol) {
    throw new Error("symbol is required");
  }
  return useQuery<API.MarketInfo>(`/public/futures/${symbol}`);
};

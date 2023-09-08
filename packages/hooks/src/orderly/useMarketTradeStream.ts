import { API } from "@orderly.network/types";
import { useQuery } from "../useQuery";

export const useMarketTradeStream = (symbol: string) => {
  if (!symbol) {
    throw new Error("useTradeStream: symbol is required");
  }

  const { data, isLoading } = useQuery<API.Trade[]>(
    `/v1/public/market_trades?symbol=${symbol}&limit=20`
  );

  return { data, isLoading };
};

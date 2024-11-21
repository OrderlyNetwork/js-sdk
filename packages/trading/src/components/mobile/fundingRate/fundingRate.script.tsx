import { useFundingRate } from "@orderly.network/hooks";

export const useFundingRateScript = (symbol: string) => {
  const data = useFundingRate(symbol);
  return { data };
};

export type FundingRateState = ReturnType<typeof useFundingRateScript>;

import { usePredictionAccountData } from "../prediction/hooks/usePredictionAccountData";

export const usePredictionPortfolioScript = usePredictionAccountData;
export type PredictionPortfolioState = ReturnType<
  typeof usePredictionPortfolioScript
>;

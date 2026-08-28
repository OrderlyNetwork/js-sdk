import { usePredictionScript } from "../prediction/prediction.script";

/**
 * Portfolio and trading-page prediction tables intentionally share one state
 * source so their records, statuses, and actions cannot drift apart.
 */
export const usePredictionPortfolioScript = usePredictionScript;

export type PredictionPortfolioState = ReturnType<
  typeof usePredictionPortfolioScript
>;

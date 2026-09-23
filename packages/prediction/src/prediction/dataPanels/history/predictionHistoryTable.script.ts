import { usePredictionFilters } from "../../predictionFilters.script";

export const usePredictionHistoryTableScript = () => {
  const filters = usePredictionFilters(true);
  return { filters };
};

export type PredictionHistoryTableScript = ReturnType<
  typeof usePredictionHistoryTableScript
>;

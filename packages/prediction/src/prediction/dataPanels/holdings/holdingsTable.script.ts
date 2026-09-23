import { usePredictionFilters } from "../../predictionFilters.script";

export const useHoldingsTableScript = () => {
  const filters = usePredictionFilters();
  return { filters };
};

export type HoldingsTableScript = ReturnType<typeof useHoldingsTableScript>;

import { usePredictionFilters } from "../../predictionFilters.script";

export type PredictionOrdersTableMode = "pending" | "filled" | "history";

export const usePredictionOrdersTableScript = (
  mode: PredictionOrdersTableMode,
) => {
  const filters = usePredictionFilters(mode === "history");
  return { filters };
};

export type PredictionOrdersTableScript = ReturnType<
  typeof usePredictionOrdersTableScript
>;

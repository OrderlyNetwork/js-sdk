import type {
  PredictionOpenOrder,
  PredictionTrade,
} from "../../prediction.types";
import type { usePredictionFilters } from "../../predictionFilters.script";

export const matchesPredictionOrderFilters = (
  filters: ReturnType<typeof usePredictionFilters>,
  order: PredictionOpenOrder | PredictionTrade,
) =>
  filters.matches({
    ...order,
    status:
      filters.status === "pending" && order.status === "partialFilled"
        ? "pending"
        : (order.status ?? "pending"),
  });

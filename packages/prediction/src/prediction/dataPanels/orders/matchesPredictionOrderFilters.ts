import { binaryOrderDisplaySide } from "../../binary/binaryOrderDisplay";
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
    // Buy/Sell filters follow the displayed action (Buy UP/DOWN vs Sell
    // UP/DOWN), not the underlying API side — a Buy DOWN order is side SELL.
    side: binaryOrderDisplaySide(order),
    status:
      filters.status === "pending" && order.status === "partialFilled"
        ? "pending"
        : (order.status ?? "pending"),
  });

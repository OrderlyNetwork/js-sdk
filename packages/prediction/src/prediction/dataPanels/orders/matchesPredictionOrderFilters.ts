import type { API } from "@orderly.network/types";
import {
  binaryOrderDisplaySide,
  binaryOrderOutcome,
  binaryOrderDisplayStatus,
} from "../../binary/binaryOrderDisplay";
import type { usePredictionFilters } from "../../predictionFilters.script";

export const matchesPredictionOrderFilters = (
  filters: ReturnType<typeof usePredictionFilters>,
  order: API.Order,
) =>
  filters.matches({
    outcome: binaryOrderOutcome(order),
    timestamp: order.created_time,
    // Buy/Sell filters follow the displayed action (Buy UP/DOWN vs Sell
    // UP/DOWN), not the underlying API side — a Buy DOWN order is side SELL.
    side: binaryOrderDisplaySide(order),
    status:
      filters.status === "pending" &&
      binaryOrderDisplayStatus(order) === "partialFilled"
        ? "pending"
        : binaryOrderDisplayStatus(order),
  });

import type { API } from "@orderly.network/types";
import type {
  PredictionResult,
  PredictionRoundPhase,
} from "../prediction.types";

/** Read committed results without reinterpreting the round's pricing rule. */
export function binaryResult(
  outcome: unknown,
  price: unknown,
): PredictionResult | undefined {
  if (outcome === "UP" && price === 1) return "up";
  if (outcome === "DOWN" && price === 0) return "down";
  if (outcome === "TIE" && price === 0.5) return "tie";
  return undefined;
}

/** Publication requires official values, independently of personal settlement. */
export function publishedBinaryOutcome(
  row?: API.BinaryInfoRow,
): PredictionResult | undefined {
  if (
    !row ||
    !Number.isFinite(row.result_committed_at) ||
    row.result_committed_at == null ||
    row.result_committed_at <= 0 ||
    !Number.isFinite(row.s0) ||
    row.s0 == null ||
    row.s0 < 0 ||
    !Number.isFinite(row.s1) ||
    row.s1 == null ||
    row.s1 < 0
  )
    return undefined;
  return binaryResult(row.outcome, row.settlement_price_per_share);
}

export function binaryResultPhase(
  result?: PredictionResult,
): PredictionRoundPhase {
  switch (result) {
    case "up":
      return "resolvedUp";
    case "down":
      return "resolvedDown";
    case "tie":
      return "resolvedTie";
    default:
      return "closed";
  }
}

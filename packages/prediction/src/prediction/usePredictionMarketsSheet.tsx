import type { MarketsSheetExtensionProps } from "@orderly.network/markets-core";
import type { UsePredictionMarketsOptions } from "./prediction.types";
import { usePredictionMarketsExtension } from "./usePredictionMarketsExtension";

/**
 * Adds the prediction market to the mobile markets sheet.
 * @param onPredictionSelect Receives the exact round symbol (e.g. `PERP_BTC5M2608271200_USDC`).
 */
export const usePredictionMarketsSheet = (
  onPredictionSelect?: (symbol: string) => void,
  options: UsePredictionMarketsOptions = {},
): MarketsSheetExtensionProps =>
  usePredictionMarketsExtension("marketsSheet", onPredictionSelect, options);

import type { DropDownMarketsExtensionProps } from "@orderly.network/markets-core";
import type { UsePredictionMarketsOptions } from "./prediction.types";
import { usePredictionMarketsExtension } from "./usePredictionMarketsExtension";

/**
 * Adds the prediction market to the existing Perps market dropdown.
 * @param onPredictionSelect Receives the exact round symbol (e.g. `PERP_BTC5M2608271200_USDC`).
 */
export const usePredictionMarketsDropdown = (
  onPredictionSelect?: (symbol: string) => void,
  options: UsePredictionMarketsOptions = {},
): DropDownMarketsExtensionProps =>
  usePredictionMarketsExtension("dropDownMarkets", onPredictionSelect, options);

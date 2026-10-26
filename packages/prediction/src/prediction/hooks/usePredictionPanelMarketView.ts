import { useMemo } from "react";
import type {
  PredictionDataTab,
  PredictionHoldingsMarketView,
} from "../prediction.types";

/** Only the holdings tab consumes live valuation. Form changes have no panel props. */
export function usePredictionPanelMarketView(
  state: PredictionHoldingsMarketView & { activeTab: PredictionDataTab },
) {
  const {
    activeTab,
    selectedRow,
    outcomePrices,
    round,
    roundPhase,
    isRoundTradable,
  } = state;
  return useMemo(
    () =>
      activeTab === "predictions"
        ? {
            selectedRow,
            outcomePrices: { up: outcomePrices.up, down: outcomePrices.down },
            round,
            roundPhase,
            isRoundTradable,
          }
        : undefined,
    [
      activeTab,
      selectedRow,
      outcomePrices.up,
      outcomePrices.down,
      round,
      roundPhase,
      isRoundTradable,
    ],
  );
}

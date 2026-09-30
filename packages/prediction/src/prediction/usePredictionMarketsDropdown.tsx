import type { DropDownMarketsExtensionProps } from "@orderly.network/markets";
import type { PredictionState } from "./prediction.script";
import { usePredictionFavorites } from "./predictionFavorites";
import {
  PredictionMarketPanelWidget,
  usePredictionMarketTabs,
} from "./predictionMarketPanel.ui";

/** Adds the prediction market to the existing Perps market dropdown. */
export const usePredictionMarketsDropdown = (
  state: PredictionState | null,
  onPredictionSelect?: (marketId: string) => void,
): DropDownMarketsExtensionProps => {
  const tabs = usePredictionMarketTabs();
  const { favoriteMarketIds, toggleFavorite } = usePredictionFavorites();
  const selectMarket = (marketId: string, hide: () => void) => {
    state?.selectMarket(marketId);
    hide();
    onPredictionSelect?.(marketId);
  };

  return {
    tabs,
    renderTabContent: (_, key, hide) =>
      key === "prediction" ? (
        <PredictionMarketPanelWidget
          markets={state?.markets ?? []}
          loading={state?.isRoundsLoading}
          favoriteMarketIds={favoriteMarketIds}
          onToggleFavorite={toggleFavorite}
          onSelect={(id) => selectMarket(id, hide)}
        />
      ) : undefined,
    renderTabAfterContent: (_, key, hide) =>
      key === "favorites" &&
      state?.markets.some((market) => favoriteMarketIds.includes(market.id)) ? (
        <PredictionMarketPanelWidget
          markets={state.markets.filter((market) =>
            favoriteMarketIds.includes(market.id),
          )}
          favoriteMarketIds={favoriteMarketIds}
          onToggleFavorite={toggleFavorite}
          onSelect={(id) => selectMarket(id, hide)}
          className="oui-flex-none oui-border-t oui-border-line-12 oui-pt-2"
        />
      ) : null,
  };
};

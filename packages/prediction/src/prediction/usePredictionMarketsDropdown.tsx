import { useLocalStorage } from "@orderly.network/hooks";
import type { DropDownMarketsExtensionProps } from "@orderly.network/markets";
import { usePredictionMarkets } from "./hooks/usePredictionMarkets";
import { usePredictionFavorites } from "./predictionFavorites";
import {
  PredictionMarketPanelWidget,
  usePredictionMarketTabs,
} from "./predictionMarketPanel.ui";

/** Adds the prediction market to the existing Perps market dropdown. */
export const usePredictionMarketsDropdown = (
  onPredictionSelect?: (marketId: string) => void,
): DropDownMarketsExtensionProps => {
  const { markets, isLoading } = usePredictionMarkets();
  const [, saveMarket] = useLocalStorage<string | null>(
    "orderly_prediction_selected_market",
    null,
  );
  const tabs = usePredictionMarketTabs();
  const { favoriteMarketIds, toggleFavorite } = usePredictionFavorites();
  const selectMarket = (marketId: string, hide: () => void) => {
    saveMarket(marketId);
    hide();
    onPredictionSelect?.(marketId);
  };

  return {
    tabs,
    renderTabContent: (_, key, hide) =>
      key === "prediction" ? (
        <PredictionMarketPanelWidget
          markets={markets}
          loading={isLoading}
          favoriteMarketIds={favoriteMarketIds}
          onToggleFavorite={toggleFavorite}
          onSelect={(id) => selectMarket(id, hide)}
        />
      ) : undefined,
    renderTabAfterContent: (_, key, hide) =>
      key === "favorites" &&
      markets.some((market) => favoriteMarketIds.includes(market.id)) ? (
        <PredictionMarketPanelWidget
          markets={markets.filter((market) =>
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

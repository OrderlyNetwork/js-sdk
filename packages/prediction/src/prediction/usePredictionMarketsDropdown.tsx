import type { DropDownMarketsExtensionProps } from "@orderly.network/markets";
import { usePredictionMarkets } from "./hooks/usePredictionMarkets";
import type { UsePredictionMarketsOptions } from "./prediction.types";
import { usePredictionFavorites } from "./predictionFavorites";
import {
  PredictionMarketPanelWidget,
  usePredictionMarketTabs,
} from "./predictionMarketPanel.ui";

/**
 * Adds the prediction market to the existing Perps market dropdown.
 * @param onPredictionSelect Receives the market family ID (e.g. `PERP_BTC5M_USDC`),
 * shared across rounds, rather than a tradable round symbol.
 */
export const usePredictionMarketsDropdown = (
  onPredictionSelect?: (marketId: string) => void,
  options: UsePredictionMarketsOptions = {},
): DropDownMarketsExtensionProps => {
  const { markets, isLoading } = usePredictionMarkets(options);
  const tabs = usePredictionMarketTabs();
  const { favoriteMarketIds, toggleFavorite } = usePredictionFavorites();
  const selectMarket = (marketId: string, hide: () => void) => {
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
          onSelect={
            onPredictionSelect ? (id) => selectMarket(id, hide) : undefined
          }
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
          onSelect={
            onPredictionSelect ? (id) => selectMarket(id, hide) : undefined
          }
          className="oui-flex-none oui-border-t oui-border-line-12 oui-pt-2"
        />
      ) : null,
  };
};

import type { DropDownMarketsExtensionProps } from "@orderly.network/markets-core";
import { usePredictionMarkets } from "./hooks/usePredictionMarkets";
import type { UsePredictionMarketsOptions } from "./prediction.types";
import { PredictionDropdownPanel } from "./predictionDropdownPanel";
import { usePredictionFavorites } from "./predictionFavorites";
import { usePredictionMarketTabs } from "./predictionMarketPanel.ui";

/**
 * Adds the prediction market to the existing Perps market dropdown.
 * @param onPredictionSelect Receives the exact round symbol (e.g. `PERP_BTC5M2608271200_USDC`).
 */
export const usePredictionMarketsDropdown = (
  onPredictionSelect?: (symbol: string) => void,
  options: UsePredictionMarketsOptions = {},
): DropDownMarketsExtensionProps => {
  const { markets, isLoading } = usePredictionMarkets(options);
  const tabs = usePredictionMarketTabs();
  const { favoriteMarketIds, toggleFavorite } = usePredictionFavorites();

  return {
    tabs,
    renderTabContent: (_, key, hide) =>
      key === "prediction" ? (
        <PredictionDropdownPanel
          markets={markets}
          loading={isLoading}
          favoriteMarketIds={favoriteMarketIds}
          onToggleFavorite={toggleFavorite}
          hide={hide}
          onPredictionSelect={onPredictionSelect}
        />
      ) : undefined,
    renderTabAfterContent: (_, key, hide) =>
      key === "favorites" &&
      markets.some((market) => favoriteMarketIds.includes(market.id)) ? (
        <PredictionDropdownPanel
          markets={markets.filter((market) =>
            favoriteMarketIds.includes(market.id),
          )}
          favoriteMarketIds={favoriteMarketIds}
          onToggleFavorite={toggleFavorite}
          hide={hide}
          onPredictionSelect={onPredictionSelect}
          className="oui-flex-none oui-border-t oui-border-line-12 oui-pt-2"
        />
      ) : null,
  };
};

import type { ReactNode } from "react";
import type {
  MarketCategoryComponentKey,
  MarketTabConfig,
} from "@orderly.network/markets-core";
import { usePredictionMarkets } from "./hooks/usePredictionMarkets";
import type { UsePredictionMarketsOptions } from "./prediction.types";
import { PredictionDropdownPanel } from "./predictionDropdownPanel";
import { usePredictionFavorites } from "./predictionFavorites";
import { usePredictionMarketTabs } from "./predictionMarketPanel.ui";

/**
 * Extension slots shared by the market-list surfaces (dropdown, sheet, side
 * panel, markets page). Structurally compatible with each surface's
 * `*ExtensionProps` type from `@orderly.network/markets-core`.
 */
export type PredictionMarketsExtensionProps = {
  tabs: MarketTabConfig[];
  renderTabContent: (
    tab: MarketTabConfig,
    key: string,
    hide: () => void,
  ) => ReactNode | undefined;
  renderTabAfterContent: (
    tab: MarketTabConfig,
    key: string,
    hide: () => void,
  ) => ReactNode;
};

/**
 * Adds the prediction markets to a market-list surface: a custom tab after
 * `crypto` plus a favorites section appended to the built-in favorites tab
 * (renderTabAfterContent is only consumed by surfaces that support it).
 *
 * @param componentKey Selects the host surface's default tab set (e.g.
 *   "dropDownMarkets", "marketsSheet", "expandMarkets", "marketsDataList").
 * @param onPredictionSelect Receives the exact round symbol, e.g. `PERP_BTC5M2608271200_USDC`.
 */
export const usePredictionMarketsExtension = (
  componentKey: MarketCategoryComponentKey,
  onPredictionSelect?: (symbol: string) => void,
  options: UsePredictionMarketsOptions = {},
): PredictionMarketsExtensionProps => {
  const { markets, isLoading } = usePredictionMarkets(options);
  const tabs = usePredictionMarketTabs(componentKey);
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

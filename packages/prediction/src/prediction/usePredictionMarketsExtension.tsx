import { useMemo, type ReactNode } from "react";
import type {
  MarketCategoryComponentKey,
  MarketTabConfig,
} from "@orderly.network/markets-core";
import { useFeatureEnabled } from "@orderly.network/react-app";
import { usePredictionMarkets } from "./hooks/usePredictionMarkets";
import type { UsePredictionMarketsOptions } from "./prediction.types";
import { PredictionDropdownPanel } from "./predictionDropdownPanel";
import { usePredictionFavorites } from "./predictionFavorites";
import { usePredictionMarketTabs } from "./predictionMarketPanel.ui";
import { filterPredictionMarkets } from "./predictionMarketSearch";

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
    context?: { searchValue?: string },
  ) => ReactNode;
};

/**
 * Adds the prediction markets to a market-list surface: a custom tab after
 * `crypto` plus sections appended to the built-in All and favorites tabs
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
  const predictionEnabled = useFeatureEnabled("prediction");
  const enabled = predictionEnabled && (options.enabled ?? true);
  const { markets, isLoading } = usePredictionMarkets({ ...options, enabled });
  const defaultTabs = usePredictionMarketTabs(componentKey);
  const tabs = useMemo(
    () =>
      enabled
        ? defaultTabs
        : defaultTabs.filter(
            (tab) => !("id" in tab && tab.id === "prediction"),
          ),
    [defaultTabs, enabled],
  );
  const { favoriteMarketIds, toggleFavorite } = usePredictionFavorites();

  return {
    tabs,
    renderTabContent: (_, key, hide) =>
      enabled && key === "prediction" ? (
        <PredictionDropdownPanel
          markets={markets}
          loading={isLoading}
          favoriteMarketIds={favoriteMarketIds}
          onToggleFavorite={toggleFavorite}
          hide={hide}
          onPredictionSelect={onPredictionSelect}
        />
      ) : undefined,
    renderTabAfterContent: (_, key, hide, context) => {
      if (!enabled || (key !== "all" && key !== "favorites")) return null;
      const candidates =
        key === "favorites"
          ? markets.filter((market) => favoriteMarketIds.includes(market.id))
          : markets;
      const visibleMarkets = filterPredictionMarkets(
        candidates,
        context?.searchValue,
      );
      if (!visibleMarkets.length) return null;
      return (
        <PredictionDropdownPanel
          markets={visibleMarkets}
          favoriteMarketIds={favoriteMarketIds}
          onToggleFavorite={toggleFavorite}
          hide={hide}
          onPredictionSelect={onPredictionSelect}
          className={`!oui-h-auto oui-flex-none oui-border-t oui-border-line-12 oui-pt-2${key === "all" ? " !oui-overflow-visible" : ""}`}
        />
      );
    },
  };
};

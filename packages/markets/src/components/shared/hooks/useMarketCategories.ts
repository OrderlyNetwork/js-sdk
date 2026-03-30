import { useMemo } from "react";
import {
  useMarketCategoriesConfig,
  type MarketCategoryComponentKey,
  type MarketTabConfig,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  builtInTabs,
  componentDefaultTabs,
} from "../../../registry/builtInTabRegistry";

/**
 * Returns the final MarketTabConfig[] for a given component.
 *
 * - If a marketTabs config function is provided, calls it with (original, context)
 * - Otherwise returns the component's default built-in tabs
 */
export function useMarketCategories(
  componentKey: MarketCategoryComponentKey,
): MarketTabConfig[] {
  const marketTabs = useMarketCategoriesConfig();
  const { i18n } = useTranslation();

  return useMemo(() => {
    const original = componentDefaultTabs[componentKey];
    if (!marketTabs) return original;
    return marketTabs(original, { componentKey, builtIn: builtInTabs });
  }, [marketTabs, componentKey, i18n.language]);
}

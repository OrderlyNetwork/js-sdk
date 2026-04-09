import { useMemo } from "react";
import {
  useMarketCategoriesConfig,
  type MarketCategoryComponentKey,
  type MarketTabConfig,
  useMarketList,
  useRwaSymbolsInfo,
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
  const symbolList = useMarketList();
  const rwaSymbolsInfo = useRwaSymbolsInfo();

  return useMemo(() => {
    const original = componentDefaultTabs[componentKey];
    const resolved = marketTabs
      ? marketTabs(original, { componentKey, builtIn: builtInTabs })
      : original;

    return resolved.filter(
      (tab) => tab.isVisible?.(symbolList, { rwaSymbolsInfo }) ?? true,
    );
  }, [marketTabs, componentKey, i18n.language, symbolList, rwaSymbolsInfo]);
}

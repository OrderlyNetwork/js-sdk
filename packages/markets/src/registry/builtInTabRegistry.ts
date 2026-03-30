import type {
  BuiltInMarketTab,
  MarketBuiltInTabType,
  MarketCategoryComponentKey,
  MarketTabConfig,
} from "../type";

/**
 * Pre-built builtIn constants for config function's context.builtIn.
 * Each entry is a built-in tab reference.
 */
export const builtInTabs: Record<MarketBuiltInTabType, BuiltInMarketTab> = {
  favorites: { type: "favorites" },
  community: { type: "community" },
  all: { type: "all" },
  rwa: { type: "rwa" },
  newListing: { type: "newListing" },
  recent: { type: "recent" },
};

/**
 * Default tab sequences for each component (as MarketTabConfig[]).
 */
export const componentDefaultTabs: Record<
  MarketCategoryComponentKey,
  MarketTabConfig[]
> = {
  marketsSheet: [
    { type: "favorites" },
    { type: "community" },
    { type: "all" },
    { type: "rwa" },
  ],
  expandMarkets: [
    { type: "favorites" },
    { type: "community" },
    { type: "all" },
    { type: "rwa" },
    { type: "newListing" },
    { type: "recent" },
  ],
  dropDownMarkets: [
    { type: "favorites" },
    { type: "community" },
    { type: "all" },
    { type: "rwa" },
    { type: "newListing" },
    { type: "recent" },
  ],
  subMenuMarkets: [
    { type: "favorites" },
    { type: "community" },
    { type: "all" },
    { type: "rwa" },
    { type: "newListing" },
    { type: "recent" },
  ],
  marketsDataList: [
    { type: "favorites" },
    { type: "community" },
    { type: "all" },
    { type: "rwa" },
    { type: "newListing" },
  ],
  horizontalMarkets: [
    { type: "all" },
    { type: "recent" },
    { type: "newListing" },
    { type: "favorites" },
  ],
};

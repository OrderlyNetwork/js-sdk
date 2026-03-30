import { useMarkets } from "@orderly.network/hooks";
import { SortOrder, Column } from "@orderly.network/ui";

// Re-export config types from hooks for convenience
export type {
  BuiltInMarketTab,
  CustomMarketTab,
  MarketBuiltInTabType,
  MarketTabConfig,
  MarketCategoryContext,
  MarketCategoryConfig,
  MarketCategoryComponentKey,
} from "@orderly.network/hooks";

export type FavoriteInstance = ReturnType<typeof useMarkets>[1];

export type SortType = {
  sortKey: string;
  sortOrder: SortOrder;
};

export type GetColumns = (
  favorite: FavoriteInstance,
  isFavoriteList: boolean,
) => Column[];

export enum MarketsPageTab {
  Markets = "markets",
  Funding = "funding",
}

export enum MarketsTabName {
  Favorites = "favorites",
  Recent = "recent",
  All = "all",
  Rwa = "rwa",
  NewListing = "newListing",
  Community = "community",
}

export enum CommunitySubTabName {
  All = "all",
  MyListings = "myListings",
  OtherListings = "otherListings",
}

export enum FundingTabName {
  Overview = "overview",
  Comparison = "comparison",
}

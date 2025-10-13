import { useMarkets } from "@kodiak-finance/orderly-hooks";
import { SortOrder, Column } from "@kodiak-finance/orderly-ui";

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
  NewListing = "newListing",
}

export enum FundingTabName {
  Overview = "overview",
  Comparison = "comparison",
}

import { useMarkets } from "@orderly.network/hooks";
import { SortOrder, Column } from "@orderly.network/ui";

export type FavoriteInstance = ReturnType<typeof useMarkets>[1];

export type SortType = {
  sortKey: string;
  sortOrder: SortOrder;
};

export type GetColumns = (
  favorite: FavoriteInstance,
  isFavoriteList: boolean,
) => Column[];

export enum TabName {
  Favorites = "favorites",
  Recent = "recent",
  All = "all",
  NewListing = "newListing",
}

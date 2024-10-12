import { useMarketList } from "@orderly.network/hooks";
import { SortOrder } from "@orderly.network/ui";
import { Column } from "./components/dataTable";

export type FavoriteInstance = ReturnType<typeof useMarketList>[1];

export type TInitialSort = {
  sortKey: string;
  sort: SortOrder;
};

export type GetColumns = (
  favorite: FavoriteInstance,
  isFavoriteList: boolean
) => Column[];

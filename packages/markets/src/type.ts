import { useMarketList } from "@orderly.network/hooks";
import { SortOrder } from "@orderly.network/ui";

export type FavoriteInstance = ReturnType<typeof useMarketList>[1];

export type TInitialSort = {
  sortKey: string;
  sort: SortOrder;
};

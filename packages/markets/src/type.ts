import { FavoriteTab, useMarketList } from "@orderly.network/hooks";
import { SortOrder } from "@orderly.network/ui";

export type MarketsFavorite = ReturnType<typeof useMarketList>[1];

export type TFavorite = MarketsFavorite & {
  curTab: FavoriteTab;
  setCurTab: (tab: FavoriteTab) => void;
};

export type TInitialSort = {
  sortKey: string;
  sort: SortOrder;
};

import { FavoriteTab, useMarkets } from "@orderly.network/hooks";

export type MarketsFavorite = ReturnType<typeof useMarkets>[1];

export type TFavorite = MarketsFavorite & {
  curTab: FavoriteTab;
  setCurTab: (tab: FavoriteTab) => void;
};

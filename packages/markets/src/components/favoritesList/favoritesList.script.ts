import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarketList } from "@orderly.network/hooks";
import { searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../marketsProvider";
import { useSideMarketsContext } from "../sideMarketsProvider";

export type UseFavoritesListReturn = ReturnType<typeof useFavoritesListScript>;

export const useFavoritesListScript = () => {
  const [data, favorite] = useMarketList(MarketsType.FAVORITES);
  const [loading, setLoading] = useState(true);

  const { favorites, selectedFavoriteTab } = favorite;

  const { searchValue } = useMarketsContext();
  const { activeTab, setCurrentDataSource } = useSideMarketsContext();

  const { onSort, getSortedList } = useSort();

  const dataSource = useMemo(() => {
    const filterList = favorites
      ?.filter(
        (item) =>
          item.tabs?.findIndex((tab) => tab.id === selectedFavoriteTab.id) !==
          -1
      )
      ?.map((fav) => {
        const index = data?.findIndex((item) => item.symbol === fav.name);
        if (index !== -1) {
          return data[index];
        }
        return null;
      })
      ?.filter((item) => item);

    const searchResults = searchBySymbol(filterList, searchValue);
    return getSortedList(searchResults);
  }, [data, selectedFavoriteTab, favorites, searchValue, getSortedList]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  useEffect(() => {
    if (activeTab === "favorites") {
      setCurrentDataSource?.(dataSource);
    }
  }, [activeTab, dataSource]);

  return {
    loading,
    dataSource,
    favorite,
    onSort,
  };
};

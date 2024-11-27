import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../../components/marketsProvider";

export type UseFavoritesListFullReturn = ReturnType<
  typeof useFavoritesListFullScript
>;

export const useFavoritesListFullScript = () => {
  const { pageSize, setPage, pagination } = usePagination({
    pageSize: 10,
  });
  const [data, favorite] = useMarkets(MarketsType.FAVORITES);
  const [loading, setLoading] = useState(true);

  const { favorites, selectedFavoriteTab } = favorite;

  const { searchValue } = useMarketsContext();

  const { onSort, getSortedList } = useSort();

  const filterData = useMemo(() => {
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

    return searchBySymbol(filterList, searchValue);
  }, [data, selectedFavoriteTab, favorites, searchValue]);

  const dataSource = useMemo(
    () => getSortedList(filterData),
    [filterData, getSortedList]
  );

  useEffect(() => {
    setLoading(false);
  }, [favorites]);

  useEffect(() => {
    // reset page when size change and search data
    setPage(1);
  }, [pageSize, searchValue]);

  return {
    loading,
    dataSource,
    favorite,
    onSort,
    pagination,
  };
};

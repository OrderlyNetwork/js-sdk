import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarkets } from "@kodiak-finance/orderly-hooks";
import { usePagination } from "@kodiak-finance/orderly-ui";
import { useMarketsContext } from "../../components/marketsProvider";
import { searchBySymbol, useSort } from "../../utils";

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
          -1,
      )
      ?.map((fav) => {
        const index = data?.findIndex((item) => item.symbol === fav.name);
        if (index !== -1) {
          return data[index];
        }
        return null;
      })
      ?.filter((item) => !!item);

    return searchBySymbol(filterList, searchValue, "base-type");
  }, [data, selectedFavoriteTab, favorites, searchValue]);

  const dataSource = useMemo(
    () => getSortedList(filterData),
    [filterData, getSortedList],
  );

  useEffect(() => {
    setLoading(false);
  }, [favorites]);

  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  return {
    loading,
    dataSource,
    favorite,
    onSort,
    pagination,
  };
};

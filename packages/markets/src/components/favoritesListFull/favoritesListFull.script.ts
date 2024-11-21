import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { PaginationMeta, usePagination } from "@orderly.network/ui";
import { getPagedData, searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../../components/marketsProvider";

export type UseFavoritesListFullReturn = ReturnType<
  typeof useFavoritesListFullScript
>;

export const useFavoritesListFullScript = () => {
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination({
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

  const { totalData, pagedData } = useMemo(() => {
    const totalData = getSortedList(filterData);
    return {
      totalData,
      pagedData: getPagedData(totalData, pageSize, page),
    };
  }, [filterData, pageSize, page, getSortedList]);

  const meta = useMemo(() => {
    return parseMeta({
      total: totalData?.length,
      current_page: page,
      records_per_page: pageSize,
    });
  }, [data, page, pageSize, totalData]);

  useEffect(() => {
    setLoading(false);
  }, [favorites]);

  useEffect(() => {
    // reset page when size change and search data
    setPage(1);
  }, [pageSize, searchValue]);

  const pagination = useMemo(
    () =>
      ({
        ...meta,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      } as PaginationMeta),
    [meta, setPage, setPageSize]
  );

  return {
    loading,
    dataSource: pagedData,
    meta,
    setPage,
    setPageSize,
    favorite,
    onSort,
    pagination,
  };
};

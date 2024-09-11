import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarketList } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { getPagedData, searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../marketsProvider";

export type UseRecentListReturn = ReturnType<typeof useRecentListScript>;

export const useRecentListScript = () => {
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();
  const [data, favorite] = useMarketList(MarketsType.RECENT);
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

  return {
    loading,
    dataSource: pagedData,
    meta,
    setPage,
    setPageSize,
    favorite,
    onSort,
  };
};

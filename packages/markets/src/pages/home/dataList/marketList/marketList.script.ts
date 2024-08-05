import { useEffect, useMemo } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { MarketListWidgetProps } from "./widget";
import { getPageData, searchBySymbol, useSort } from "../../../../utils";
import { TFavorite } from "../../../../type";
import { useMarketsContext } from "../../provider";

export type UseMarketListScriptOptions = MarketListWidgetProps;
export type UseMarketListReturn = ReturnType<typeof useMarketListScript>;

export const useMarketListScript = (options: UseMarketListScriptOptions) => {
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [data, favorite] = useMarkets(MarketsType.ALL);

  const { searchValue } = useMarketsContext();

  const { onSort, getSortedList, sortKey, sortOrder } = useSort(
    options?.sortKey,
    options?.sortOrder
  );

  const pageData = useMemo(() => {
    const list = getSortedList(data);
    const filterList = searchBySymbol(list, searchValue);
    return getPageData(filterList, pageSize, page);
  }, [data, pageSize, page, getSortedList, searchValue]);

  const meta = useMemo(() => {
    const _data = searchValue ? pageData : data;
    return parseMeta({
      total: _data?.length,
      current_page: page,
      records_per_page: pageSize,
    });
  }, [data, page, pageSize, searchValue, pageData]);

  useEffect(() => {
    // reset page when size change and search data
    setPage(1);
  }, [pageSize, searchValue]);

  useEffect(() => {
    // Only all markets store sort
    if (options.type === "all") {
      favorite.updateTabsSortState("all", sortKey!, sortOrder!);
    }
  }, [sortKey, sortOrder, favorite, options.type]);

  return {
    dataSource: pageData,
    meta,
    setPage,
    setPageSize,
    favorite: favorite as TFavorite,
    onSort,
  };
};

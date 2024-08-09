import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { MarketListWidgetProps } from "./widget";
import { getPagedData, searchBySymbol, useSort } from "../../../../utils";
import { TFavorite } from "../../../../type";
import { useMarketsContext } from "../../provider";

export type UseMarketListScriptOptions = MarketListWidgetProps;
export type UseMarketListReturn = ReturnType<typeof useMarketListScript>;

export const useMarketListScript = (options: UseMarketListScriptOptions) => {
  const [loading, setLoading] = useState(true);
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [data, favorite] = useMarkets(MarketsType.ALL);

  const { searchValue } = useMarketsContext();

  const { onSort, getSortedList, sortKey, sortOrder } = useSort(
    options?.sortKey,
    options?.sortOrder
  );

  const { totalData, pagedData } = useMemo(() => {
    const list = getSortedList(data);
    const totalData = searchBySymbol(list, searchValue);
    return {
      totalData,
      pagedData: getPagedData(totalData, pageSize, page),
    };
  }, [data, pageSize, page, getSortedList, searchValue]);

  const meta = useMemo(() => {
    return parseMeta({
      total: totalData?.length,
      current_page: page,
      records_per_page: pageSize,
    });
  }, [data, page, pageSize, totalData]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

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
    loading,
    dataSource: pagedData,
    meta,
    setPage,
    setPageSize,
    favorite: favorite as TFavorite,
    onSort,
  };
};

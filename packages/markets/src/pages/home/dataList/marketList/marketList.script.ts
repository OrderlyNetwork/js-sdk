import { useEffect, useMemo } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { SortOrder, usePagination } from "@orderly.network/ui";
import { MarketListWidgetProps } from "./widget";
import { getPageData, useSort } from "../../../../utils";
import { TFavorite } from "../../../../type";

export type UseMarketListScriptOptions = MarketListWidgetProps;
export type UseMarketListReturn = ReturnType<typeof useMarketListScript>;

export const useMarketListScript = (options: UseMarketListScriptOptions) => {
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const [data, favorite] = useMarkets(MarketsType.ALL);

  const { onSort, getSortedList } = useSort(
    options?.sortKey,
    options?.sortOrder
  );

  const pageData = useMemo(() => {
    const list = getSortedList(data);
    return getPageData(list, pageSize, page);
  }, [data, pageSize, page, getSortedList]);

  const meta = useMemo(
    () =>
      parseMeta({
        total: data?.length,
        current_page: page,
        records_per_page: pageSize,
      }),
    [data, page, pageSize]
  );

  useEffect(() => {
    // 切换页面大小时，重置页码
    setPage(1);
  }, [pageSize]);

  return {
    dataSource: pageData,
    meta,
    setPage,
    setPageSize,
    favorite: favorite as TFavorite,
    onSort,
  };
};

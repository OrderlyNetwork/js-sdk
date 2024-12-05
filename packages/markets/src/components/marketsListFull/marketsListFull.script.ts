import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { MarketsListFullWidgetProps } from "./widget";
import { searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../../components/marketsProvider";

export type UseMarketsListFullScriptOptions = MarketsListFullWidgetProps;

export type UseMarketsListFullReturn = ReturnType<
  typeof useMarketsListFullScript
>;

export const useMarketsListFullScript = (
  options: UseMarketsListFullScriptOptions
) => {
  const [loading, setLoading] = useState(true);
  const { pageSize, setPage, pagination } = usePagination({
    pageSize: 10,
  });

  const [data, favorite] = useMarkets(MarketsType.ALL);

  const { searchValue } = useMarketsContext();

  const { onSort, getSortedList, sortKey, sortOrder } = useSort(
    options?.sortKey,
    options?.sortOrder
  );

  const dataSource = useMemo(() => {
    const list = getSortedList(data);
    return searchBySymbol(list, searchValue);
  }, [data, getSortedList, searchValue]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  useEffect(() => {
    // Only all markets store sort
    if (options.type === "all") {
      favorite.updateTabsSortState("all", sortKey!, sortOrder!);
    }
  }, [sortKey, sortOrder, options.type]);

  return {
    loading,
    dataSource,
    favorite,
    onSort,
    pagination,
  };
};

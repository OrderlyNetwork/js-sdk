import { useEffect, useMemo, useRef, useState } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { TableSort, usePagination } from "@orderly.network/ui";
import { useMarketsContext } from "../../components/marketsProvider";
import { searchBySymbol, useSort } from "../../utils";
import { MarketsListFullWidgetProps } from "./marketsListFull.widget";

export type UseMarketsListFullScriptOptions = MarketsListFullWidgetProps;

export type UseMarketsListFullReturn = ReturnType<
  typeof useMarketsListFullScript
>;

const MarketsTypeMap = {
  all: MarketsType.ALL,
  new: MarketsType.NEW_LISTING,
  rwa: MarketsType.RWA,
};

export type MarketsListFullType = keyof typeof MarketsTypeMap;

export const useMarketsListFullScript = (
  options: UseMarketsListFullScriptOptions,
) => {
  const { type = "all" } = options;
  const [loading, setLoading] = useState(true);
  const { setPage, pagination } = usePagination({
    pageSize: 10,
  });

  const [data, favorite] = useMarkets(MarketsTypeMap[type]);

  const { searchValue } = useMarketsContext();

  const { onSort, getSortedList, sort } = useSort(options.initialSort);

  const dataSource = useMemo(() => {
    const searchList = searchBySymbol(data, searchValue, "base-type");
    return getSortedList(searchList);
  }, [data, getSortedList, searchValue]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  useEffect(() => {
    // Only all markets store sort
    if (type === "all") {
      favorite.updateTabsSortState("all", sort?.sortKey!, sort?.sortOrder!);
    }
  }, [sort, type]);

  const initialSort = useMemo(() => {
    const sortStore = type === "all" ? favorite.tabSort?.all : undefined;

    return {
      sortKey: sortStore?.sortKey || options?.initialSort?.sortKey,
      sort: sortStore?.sortOrder || options?.initialSort?.sortOrder,
    } as TableSort;
  }, [favorite.tabSort, options.initialSort, type]);

  return {
    loading,
    dataSource,
    favorite,
    onSort,
    pagination,
    initialSort,
  };
};

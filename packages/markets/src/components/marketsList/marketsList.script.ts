import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarketList } from "@orderly.network/hooks";
import { MarketsListWidgetProps } from "./widget";
import { searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../marketsProvider";

export type UseMarketsListScriptOptions = MarketsListWidgetProps;

export type UseMarketsListReturn = ReturnType<typeof useMarketsListScript>;

export const useMarketsListScript = (options: UseMarketsListScriptOptions) => {
  const [loading, setLoading] = useState(true);

  const [data, favorite] = useMarketList(MarketsType.ALL);

  const { searchValue } = useMarketsContext();

  const { onSort, getSortedList } = useSort(
    options?.sortKey,
    options?.sortOrder,
    options.onSort
  );

  const dataSource = useMemo(() => {
    const searchResults = searchBySymbol(data, searchValue);
    return getSortedList(searchResults);
  }, [data, getSortedList, searchValue]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  return {
    loading,
    dataSource,
    favorite,
    onSort,
  };
};

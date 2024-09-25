import { useEffect, useMemo, useState } from "react";
import {
  MarketsType,
  useMarketList,
  useSessionStorage,
} from "@orderly.network/hooks";
import { MarketsListWidgetProps } from "./widget";
import { searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../marketsProvider";
import { useSideMarketsContext } from "../sideMarketsProvider";

export type UseMarketsListScriptOptions = MarketsListWidgetProps;

export type UseMarketsListReturn = ReturnType<typeof useMarketsListScript>;

export const useMarketsListScript = (options: UseMarketsListScriptOptions) => {
  const [loading, setLoading] = useState(true);

  const [data, favorite] = useMarketList(MarketsType.ALL);

  const { searchValue } = useMarketsContext();
  const { activeTab, setCurrentDataSource } = useSideMarketsContext();

  const [tabSort, setTabSort] = useSessionStorage(
    "orderly_markets_tab_sort",
    {} as any
  );

  const { onSort, getSortedList, sortKey, sortOrder } = useSort(
    options?.sortKey,
    options?.sortOrder
  );

  const dataSource = useMemo(() => {
    const searchResults = searchBySymbol(data, searchValue);
    return getSortedList(searchResults);
  }, [data, getSortedList, searchValue]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  useEffect(() => {
    if (options.type === "all") {
      setTabSort({
        ...tabSort,
        all: {
          sortKey,
          sortOrder,
        },
      });
    }
  }, [sortKey, sortOrder, options.type]);

  useEffect(() => {
    if (activeTab === "all") {
      setCurrentDataSource?.(dataSource);
    }
  }, [activeTab, dataSource]);

  return {
    loading,
    dataSource,
    favorite,
    onSort,
    tabSort,
  };
};

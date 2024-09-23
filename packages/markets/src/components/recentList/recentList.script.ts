import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarketList } from "@orderly.network/hooks";
import { searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../marketsProvider";
import { useSideMarketsContext } from "../sideMarketsProvider";

export type UseRecentListReturn = ReturnType<typeof useRecentListScript>;

export const useRecentListScript = () => {
  const [data, favorite] = useMarketList(MarketsType.RECENT);
  const [loading, setLoading] = useState(true);

  const { searchValue } = useMarketsContext();
  const { activeTab, setCurrentDataSource } = useSideMarketsContext();

  const { onSort, getSortedList } = useSort();

  const dataSource = useMemo(() => {
    const searchResults = searchBySymbol(data, searchValue);
    return getSortedList(searchResults);
  }, [data, searchValue, getSortedList]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  useEffect(() => {
    if (activeTab === "recent") {
      setCurrentDataSource?.(dataSource);
    }
  }, [activeTab, dataSource]);

  return {
    loading,
    dataSource,
    favorite,
    onSort,
  };
};

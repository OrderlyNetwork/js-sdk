import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../marketsProvider";

export type UseNewListingListReturn = ReturnType<
  typeof useNewListingListScript
>;

export const useNewListingListScript = () => {
  const [data, favorite] = useMarkets(MarketsType.NEW_LISTING);
  const [loading, setLoading] = useState(true);

  const { searchValue } = useMarketsContext();

  const { onSort, getSortedList } = useSort();

  const dataSource = useMemo(() => {
    const searchResults = searchBySymbol(data, searchValue);
    return getSortedList(searchResults);
  }, [data, searchValue, getSortedList]);

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

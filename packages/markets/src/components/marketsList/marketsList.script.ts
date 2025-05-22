import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { TabName } from "../../type";
import { searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../marketsProvider";
import { type MarketsListWidgetProps } from "./widget";

export type MarketsListScriptOptions = MarketsListWidgetProps;

export type MarketsListScriiptReturn = ReturnType<typeof useMarketsListScript>;

const MarketsTypeMap = {
  [TabName.All]: MarketsType.ALL,
  [TabName.Favorites]: MarketsType.FAVORITES,
  [TabName.Recent]: MarketsType.RECENT,
  [TabName.NewListing]: MarketsType.NEW_LISTING,
};

export const useMarketsListScript = (options: MarketsListScriptOptions) => {
  const [loading, setLoading] = useState(true);

  const [data, favorite] = useMarkets(
    MarketsTypeMap[options.type] || MarketsType.ALL,
  );

  const { favorites, selectedFavoriteTab } = favorite;

  const { searchValue } = useMarketsContext();

  const { onSort, getSortedList } = useSort(
    options.initialSort,
    options.onSort,
  );

  const dataSource = useMemo(() => {
    const filterList =
      typeof options.dataFilter === "function"
        ? options.dataFilter(data, { favorites, selectedFavoriteTab })
        : data;
    const searchResults = searchBySymbol(filterList, searchValue, "base");
    return getSortedList(searchResults);
  }, [
    data,
    getSortedList,
    searchValue,
    options.dataFilter,
    favorites,
    selectedFavoriteTab,
  ]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  const isFavoritesList = options.type === TabName.Favorites;

  return {
    loading,
    dataSource,
    favorite,
    onSort,
    isFavoritesList,
  };
};

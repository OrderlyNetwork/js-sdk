import { useEffect, useMemo, useState } from "react";
import { MarketsType, useMarkets } from "@kodiak-finance/orderly-hooks";
import { MarketsTabName } from "../../type";
import { searchBySymbol, useSort } from "../../utils";
import { useMarketsContext } from "../marketsProvider";
import { type MarketsListWidgetProps } from "./marketsList.widget";

export type MarketsListScriptOptions = MarketsListWidgetProps;

export type MarketsListScriiptReturn = ReturnType<typeof useMarketsListScript>;

const MarketsTypeMap = {
  [MarketsTabName.All]: MarketsType.ALL,
  [MarketsTabName.Favorites]: MarketsType.FAVORITES,
  [MarketsTabName.Recent]: MarketsType.RECENT,
  [MarketsTabName.NewListing]: MarketsType.NEW_LISTING,
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

  const isFavoritesList = options.type === MarketsTabName.Favorites;

  return {
    loading,
    dataSource,
    favorite,
    onSort,
    isFavoritesList,
  };
};

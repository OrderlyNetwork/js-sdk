import { useEffect, useMemo, useRef, useState } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { getPageData, useSort } from "../../../utils";
import { TFavorite } from "../../../type";

export type UseFavoritesReturn = ReturnType<typeof useFavoritesScript>;

export const useFavoritesScript = () => {
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();
  const [data, favorite] = useMarkets(MarketsType.FAVORITES);

  const { favorites, favoriteTabs, getLastSelFavTab } = favorite;

  const [curTab, setCurTab] = useState(getLastSelFavTab() || favoriteTabs[0]);

  const { onSort, getSortedList } = useSort();

  const filterData = useMemo(() => {
    return favorites
      ?.filter(
        (item) => item.tabs?.findIndex((tab) => tab.id === curTab.id) !== -1
      )
      ?.map((fav) => {
        const index = data?.findIndex((item) => item.symbol === fav.name);
        if (index !== -1) {
          return data[index];
        }
        return null;
      })
      ?.filter((item) => item);
  }, [data, curTab, favorites]);

  const pageData = useMemo(() => {
    const list = getSortedList(filterData);
    return getPageData(list, pageSize, page);
  }, [filterData, pageSize, page, getSortedList]);

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
    favorite: {
      ...favorite,
      curTab,
      setCurTab,
    } as TFavorite,
    onSort,
  };
};

export function useFavoritesTabScript(favorite: TFavorite) {
  const {
    favorites,
    favoriteTabs,
    updateFavoriteTabs,
    updateSelectedFavoriteTab,
    updateSymbolFavoriteState,
    curTab,
    setCurTab,
  } = favorite;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onBlur = () => {
    updateFavoriteTabs(
      {
        ...curTab,
        name: value,
      },
      { update: true }
    );
    setEditing(false);
  };

  const onEdit = (item: any) => {
    setEditing(true);
    setValue(item.name);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(-1, -1);
    }, 0);
  };

  const onAdd = (item: any) => {
    setCurTab(item);
    updateSelectedFavoriteTab(item);
  };

  const addTab = () => {
    const newTab = {
      name: `WatchList_${favoriteTabs.length}`,
      id: Date.now(),
    };
    updateFavoriteTabs(newTab, { add: true });
    setCurTab(newTab);
    updateSelectedFavoriteTab(newTab);
  };

  const delTab = (selectedTab: any) => {
    updateFavoriteTabs(selectedTab, { delete: true });

    setTimeout(() => {
      // remove all symbol favorite in this tab
      favorites.forEach((item) => {
        const find = item.tabs?.find((tab) => tab.id === selectedTab.id);
        if (find) {
          updateSymbolFavoriteState(
            { symbol: item.name } as any,
            selectedTab,
            true
          );
        }
      });

      // auto selected last tab
      const tabs = favoriteTabs.filter((item) => item.id !== selectedTab.id);
      const tab = tabs?.[tabs?.length - 1] || tabs?.[0];
      setCurTab(tab);
      updateSelectedFavoriteTab(tab);
    }, 0);
  };

  return {
    inputRef,
    editing,
    value,
    onValueChange: setValue,
    onBlur,
    onEdit,
    onAdd,
    addTab,
    delTab,
  };
}

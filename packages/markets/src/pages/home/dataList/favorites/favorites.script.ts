import { useEffect, useMemo, useRef, useState } from "react";
import { MarketsType, useMarkets } from "@orderly.network/hooks";
import { usePagination } from "@orderly.network/ui";
import { getPageData, searchBySymbol, useSort } from "../../../../utils";
import { TFavorite } from "../../../../type";
import { useMarketsContext } from "../../provider";

export type UseFavoritesReturn = ReturnType<typeof useFavoritesScript>;

export const useFavoritesScript = () => {
  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();
  const [data, favorite] = useMarkets(MarketsType.FAVORITES);

  const { favorites, favoriteTabs, getLastSelFavTab } = favorite;

  const { searchValue } = useMarketsContext();

  const [curTab, setCurTab] = useState(getLastSelFavTab() || favoriteTabs[0]);

  const { onSort, getSortedList } = useSort();

  const filterData = useMemo(() => {
    const filterList = favorites
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

    return searchBySymbol(filterList, searchValue);
  }, [data, curTab, favorites, searchValue]);

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
    updateFavorites,
    curTab,
    setCurTab,
  } = favorite;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(50);

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
      const _favorites = favorites.map((item) => ({
        ...item,
        tabs: item.tabs?.filter((tab) => tab.id !== selectedTab.id),
      }));

      updateFavorites(_favorites);

      // auto selected last tab
      const tabs = favoriteTabs.filter((item) => item.id !== selectedTab.id);
      const tab = tabs?.[tabs?.length - 1] || tabs?.[0];
      setCurTab(tab);
      updateSelectedFavoriteTab(tab);
    }, 0);
  };

  useEffect(() => {
    if (value) {
      const rect = spanRef.current?.getBoundingClientRect();
      console.log("rect", rect);
      setInputWidth(Math.max(rect?.width || 0, 50));
      // if (inputRef.current) {
      //   inputRef.current.style.width = `${Math.max(rect?.width || 0, 50)}.px`;
      // }
    }
  }, [value]);

  return {
    inputRef,
    inputWidth,
    spanRef,
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

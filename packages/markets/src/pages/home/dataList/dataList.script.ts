import { useEffect, useState } from "react";
import { FavoriteTab } from "@orderly.network/hooks";
import { type FavoritesDropdownMenuProps } from "./dataList.ui";
import { useMarketsContext } from "../provider";

export type TabName = "favorites" | "all" | "new";

export type UseMarketsDataListScript = ReturnType<
  typeof useMarketsDataListScript
>;

export function useMarketsDataListScript() {
  const [activeTab, setActiveTab] = useState<TabName>("all");
  const { clearSearchValue } = useMarketsContext();

  useEffect(() => {
    clearSearchValue?.();
  }, [activeTab]);

  return {
    activeTab,
    onTabChange: (value: string) => setActiveTab(value as TabName),
  };
}

export function useFavoritesDropdownMenuScript(
  props: FavoritesDropdownMenuProps
) {
  const { symbol } = props.row || {};
  const {
    favorites,
    favoriteTabs,
    updateFavoriteTabs,
    updateSymbolFavoriteState,
  } = props.favorite;
  const [open, setOpen] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [value, setValue] = useState("");
  const [selectedTabs, setSelectedTabs] = useState([] as FavoriteTab[]);

  const hide = () => {
    setOpen(false);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const hideInput = () => {
    setInputVisible(false);
  };

  const clearState = () => {
    setValue("");
    hideInput();
    setSelectedTabs([]);
  };

  const addTab = () => {
    const newTab = {
      name: value || `WatchList_${favoriteTabs.length}`,
      id: Date.now(),
    };
    updateFavoriteTabs(newTab, { add: true });
    clearState();
  };

  const onCheck = (item: FavoriteTab, checked: boolean) => {
    if (checked) {
      setSelectedTabs(selectedTabs?.filter((tab) => tab.id !== item.id));
    } else {
      setSelectedTabs([...selectedTabs, item]);
    }
  };

  const confirm = () => {
    // if tab is arrary, the del params is not work
    // if tab is empty array, will be delete, otherwise will be override
    updateSymbolFavoriteState(props.row, selectedTabs, false);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const find = favorites?.find((item) => item.name === symbol);
    if (find?.tabs?.length) {
      setSelectedTabs(find?.tabs);
    }
  }, [open, favorites, favoriteTabs, symbol]);

  useEffect(() => {
    if (!open) {
      clearState();
    }
  }, [open]);

  return {
    open,
    onOpenChange: setOpen,
    inputVisible,
    selectedTabs,
    value,
    onValueChange: setValue,
    hide,
    hideInput,
    showInput,
    onCheck,
    addTab,
    confirm,
  };
}

import { useCallback, useEffect, useState } from "react";
import { SIDE_MARKETS_TAB_SORT_STORAGE_KEY } from "../../constant";
import { TabName } from "../../type";
import { useMarketsContext } from "../marketsProvider";
import { useTabSort } from "../shared/hooks/useTabSort";

export type ExpandMarketsScriptOptions = {
  activeTab?: TabName;
  onTabChange?: (tab: TabName) => void;
};

export type ExpandMarketsScriptReturn = ReturnType<
  typeof useExpandMarketsScript
>;

export function useExpandMarketsScript(options: ExpandMarketsScriptOptions) {
  const [activeTab, setActiveTab] = useState<TabName>(options.activeTab!);

  const { tabSort, onTabSort } = useTabSort({
    storageKey: SIDE_MARKETS_TAB_SORT_STORAGE_KEY,
  });

  const { clearSearchValue } = useMarketsContext();

  const onTabChange = useCallback(
    (value: string) => {
      if (typeof options?.onTabChange === "function") {
        options.onTabChange(value as TabName);
      } else {
        setActiveTab(value as TabName);
      }
    },
    [options?.onTabChange],
  );
  useEffect(() => {
    setActiveTab(options?.activeTab || TabName.Favorites);
  }, [options?.activeTab]);

  useEffect(() => {
    clearSearchValue?.();
  }, [activeTab]);

  return {
    activeTab,
    onTabChange,
    tabSort,
    onTabSort,
  };
}

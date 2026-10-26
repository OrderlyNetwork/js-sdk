import { useEffect, useState } from "react";
import { useMarketsContext } from "../../../components/marketsProvider";
import { useTabSort } from "../../../components/shared/hooks/useTabSort";
import { tabKey } from "../../../components/shared/tabUtils";
import { MarketsTabName } from "../../../type";

export type UseMarketsDataListScript = ReturnType<
  typeof useMarketsDataListScript
>;

const MOBILE_MARKETS_TAB_SORT_STORAGE_KEY = "orderly_mobile_markets_tab_sort";

export function useMarketsDataListScript() {
  const [activeTab, setActiveTab] = useState<string>(MarketsTabName.All);
  const { clearSearchValue, searchValue, tabs } = useMarketsContext();

  const { tabSort, onTabSort } = useTabSort({
    storageKey: MOBILE_MARKETS_TAB_SORT_STORAGE_KEY,
  });

  const effectiveActiveTab = tabs?.some(
    (tab, index) => tabKey(tab, index) === activeTab,
  )
    ? activeTab
    : tabs?.length
      ? tabKey(tabs[0], 0)
      : activeTab;

  // Keep the selection valid before children render, including custom tabs.
  if (effectiveActiveTab !== activeTab) {
    setActiveTab(effectiveActiveTab);
  }

  useEffect(() => {
    clearSearchValue?.();
  }, [effectiveActiveTab, clearSearchValue]);

  return {
    activeTab: effectiveActiveTab,
    onTabChange: (value: string) => setActiveTab(value),
    tabSort,
    onTabSort,
    searchValue,
  };
}

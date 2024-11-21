import { useCallback, useEffect, useState } from "react";
import { useMarketsContext } from "../marketsProvider";
import { SortOrder } from "@orderly.network/ui";
import { useTabSort } from "../shared/hooks/useTabSort";

export type TabName = "favorites" | "recent" | "all";

export type UseExpandMarketsScriptOptions = {
  activeTab?: TabName;
  onTabChange?: (tab: TabName) => void;
};

export type UseExpandMarketsScriptReturn = ReturnType<
  typeof useExpandMarketsScript
>;

export function useExpandMarketsScript(
  options?: UseExpandMarketsScriptOptions
) {
  const [activeTab, setActiveTab] = useState<TabName>(options?.activeTab!);

  const { tabSort, onTabSort } = useTabSort({
    storageKey: "orderly_side_markets_tab_sort",
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
    [options?.onTabChange]
  );
  useEffect(() => {
    setActiveTab(options?.activeTab || "favorites");
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

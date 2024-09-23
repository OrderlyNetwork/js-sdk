import { useCallback, useEffect, useState } from "react";
import { useMarketsContext } from "../marketsProvider";

export type UseDropDownMarketsScriptOptions = {};

export type TabName = "favorites" | "recent" | "all";

export type UseDropDownMarketsScriptReturn = ReturnType<
  typeof useDropDownMarketsScript
>;

export function useDropDownMarketsScript(
  options?: UseDropDownMarketsScriptOptions
) {
  const [activeTab, setActiveTab] = useState<TabName>("favorites");
  const { clearSearchValue } = useMarketsContext();

  useEffect(() => {
    clearSearchValue?.();
  }, [activeTab]);

  return {
    activeTab,
    onTabChange: (value: string) => setActiveTab(value as TabName),
  };
}

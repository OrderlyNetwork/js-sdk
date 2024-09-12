import { useEffect, useState } from "react";
import { useMarketsContext } from "../marketsProvider";

export type TabName = "favorites" | "recent" | "all";

export type UseExpandMarketsScriptReturn = ReturnType<
  typeof useExpandMarketsScript
>;

export function useExpandMarketsScript() {
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

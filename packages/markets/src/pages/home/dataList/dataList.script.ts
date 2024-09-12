import { useEffect, useState } from "react";
import { useMarketsContext } from "../../../components/marketsProvider";

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

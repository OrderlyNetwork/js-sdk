import { useState } from "react";

export type TabName = "favorites" | "all" | "new";

export type UseMarketsDataListScript = ReturnType<
  typeof useMarketsDataListScript
>;

export const useMarketsDataListScript = () => {
  const [activeTab, setActiveTab] = useState<TabName>("favorites");

  return {
    activeTab,
    onTabChange: (value: string) => setActiveTab(value as TabName),
  };
};

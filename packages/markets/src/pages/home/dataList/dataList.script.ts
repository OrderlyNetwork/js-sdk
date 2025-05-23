import { useEffect, useState } from "react";
import { useMarketsContext } from "../../../components/marketsProvider";
import { TabName } from "../../../type";

export type UseMarketsDataListScript = ReturnType<
  typeof useMarketsDataListScript
>;

export function useMarketsDataListScript() {
  const [activeTab, setActiveTab] = useState<TabName>(TabName.All);
  const { clearSearchValue } = useMarketsContext();

  useEffect(() => {
    clearSearchValue?.();
  }, [activeTab]);

  return {
    activeTab,
    onTabChange: (value: string) => setActiveTab(value as TabName),
  };
}

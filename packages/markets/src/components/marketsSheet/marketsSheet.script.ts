import { useState } from "react";
import { SIDE_MARKETS_TAB_SORT_STORAGE_KEY } from "../../constant";
import { MarketsTabName } from "../../type";
import { useTabSort } from "../shared/hooks/useTabSort";

export type MarketsSheetScriptReturn = ReturnType<typeof useMarketsSheetScript>;

export function useMarketsSheetScript() {
  const { tabSort, onTabSort } = useTabSort({
    storageKey: SIDE_MARKETS_TAB_SORT_STORAGE_KEY,
  });

  const [activeTab, setActiveTab] = useState<MarketsTabName>(
    MarketsTabName.Favorites,
  );

  return { tabSort, onTabSort, activeTab, onTabChange: setActiveTab };
}

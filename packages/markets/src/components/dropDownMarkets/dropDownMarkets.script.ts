import { useCallback, useEffect, useState } from "react";
import { useMarketsContext } from "../marketsProvider";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTabSort } from "../shared/hooks/useTabSort";

export type UseDropDownMarketsScriptOptions = {};

export type TabName = "favorites" | "recent" | "all";

export type UseDropDownMarketsScriptReturn = ReturnType<
  typeof useDropDownMarketsScript
>;

export function useDropDownMarketsScript(
  options?: UseDropDownMarketsScriptOptions
) {
  const [open, setOpen] = useState(false);
  // const [activeTab, setActiveTab] = useState<TabName>("favorites");
  const [activeTab, setActiveTab] = useLocalStorage(
    "orderly_dropdown_markets_sel_tab_key",
    "all"
  );

  const { tabSort, onTabSort } = useTabSort({
    storageKey: "orderly_dropdown_markets_tab_sort",
  });

  const { clearSearchValue } = useMarketsContext();

  const hide = () => {
    setOpen(false);
  };

  useEffect(() => {
    clearSearchValue?.();
  }, [activeTab]);

  return {
    activeTab,
    onTabChange: (value: string) => setActiveTab(value as TabName),
    open,
    onOpenChange: setOpen,
    hide,
    tabSort,
    onTabSort,
  };
}

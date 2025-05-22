import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { SIDE_MARKETS_TAB_SORT_STORAGE_KEY } from "../../constant";
import { TabName } from "../../type";
import { useTabSort } from "../shared/hooks/useTabSort";

export type SideMarketsScriptOptions = {
  collapsable?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
};

export type SideMarketsScriptReturn = ReturnType<typeof useSideMarketsScript>;

const SIDE_MARKETS_SEL_TAB_KEY = "orderly_side_markets_sel_tab_key";

export function useSideMarketsScript(options?: SideMarketsScriptOptions) {
  const [collapsed, setCollapsed] = useState(options?.collapsed);
  const [activeTab, setActiveTab] = useLocalStorage(
    SIDE_MARKETS_SEL_TAB_KEY,
    TabName.All,
  );

  const { tabSort } = useTabSort({
    storageKey: SIDE_MARKETS_TAB_SORT_STORAGE_KEY,
  });

  const collapsable = useMemo(
    () => options?.collapsable ?? true,
    [options?.collapsable],
  );

  const onCollapse = useCallback(
    (collapsed: boolean) => {
      if (typeof options?.onCollapse === "function") {
        options.onCollapse(collapsed);
      } else {
        setCollapsed(collapsed);
      }
    },
    [options?.onCollapse],
  );

  useEffect(() => {
    setCollapsed(options?.collapsed);
  }, [options?.collapsed]);

  return {
    collapsable,
    collapsed,
    onCollapse,
    activeTab: activeTab as TabName,
    onTabChange: setActiveTab,
    tabSort,
  };
}

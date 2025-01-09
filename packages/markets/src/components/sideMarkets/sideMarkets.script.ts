import { useLocalStorage } from "@orderly.network/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";

export type UseSideMarketsScriptOptions = {
  collapsable?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
};

export type UseSideMarketsScriptReturn = ReturnType<
  typeof useSideMarketsScript
>;

export function useSideMarketsScript(options?: UseSideMarketsScriptOptions) {
  const [collapsed, setCollapsed] = useState(options?.collapsed);
  // const [activeTab, setActiveTab] = useState<TabName>("all");
  const [activeTab, setActiveTab] = useLocalStorage(
    "orderly_side_markets_sel_tab_key",
    "all"
  );

  const collapsable = useMemo(
    () => options?.collapsable ?? true,
    [options?.collapsable]
  );

  const onCollapse = useCallback(
    (collapsed: boolean) => {
      if (typeof options?.onCollapse === "function") {
        options.onCollapse(collapsed);
      } else {
        setCollapsed(collapsed);
      }
    },
    [options?.onCollapse]
  );

  useEffect(() => {
    setCollapsed(options?.collapsed);
  }, [options?.collapsed]);

  return {
    collapsable,
    collapsed,
    onCollapse,
    activeTab,
    onTabChange: setActiveTab,
  };
}

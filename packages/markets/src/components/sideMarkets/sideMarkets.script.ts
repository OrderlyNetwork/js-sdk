import { useLocalStorage } from "@orderly.network/hooks";
import { useCallback, useEffect, useState } from "react";

export type UseSideMarketsScriptOptions = {
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

  useEffect(() => {
    setCollapsed(options?.collapsed);
  }, [options?.collapsed]);

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

  return { collapsed, onCollapse, activeTab, onTabChange: setActiveTab };
}

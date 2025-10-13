import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "@kodiak-finance/orderly-hooks";
import { SIDE_MARKETS_TAB_SORT_STORAGE_KEY } from "../../constant";
import { MarketsTabName } from "../../type";
import { useTabSort } from "../shared/hooks/useTabSort";

export type SideMarketsScriptOptions = {
  resizeable?: boolean;
  panelSize?: "small" | "middle" | "large";
  onPanelSizeChange?: React.Dispatch<
    React.SetStateAction<"small" | "middle" | "large">
  >;
};

export type SideMarketsScriptReturn = ReturnType<typeof useSideMarketsScript>;

const SIDE_MARKETS_SEL_TAB_KEY = "orderly_side_markets_sel_tab_key";

export const useSideMarketsScript = (options?: SideMarketsScriptOptions) => {
  const [panelSize, setPanelSize] = useState(options?.panelSize);
  const [activeTab, setActiveTab] = useLocalStorage(
    SIDE_MARKETS_SEL_TAB_KEY,
    MarketsTabName.All,
  );

  const { tabSort } = useTabSort({
    storageKey: SIDE_MARKETS_TAB_SORT_STORAGE_KEY,
  });

  const onPanelSizeChange = useCallback(
    (size: "small" | "middle" | "large") => {
      if (typeof options?.onPanelSizeChange === "function") {
        options.onPanelSizeChange(size);
      } else {
        setPanelSize(size);
      }
    },
    [options?.onPanelSizeChange],
  );

  useEffect(() => {
    setPanelSize(options?.panelSize);
  }, [options?.panelSize]);

  return {
    resizeable: options?.resizeable ?? true,
    panelSize: panelSize,
    onPanelSizeChange: onPanelSizeChange as React.Dispatch<
      React.SetStateAction<"small" | "middle" | "large">
    >,
    activeTab: activeTab as MarketsTabName,
    onTabChange: setActiveTab,
    tabSort: tabSort,
  } as const;
};

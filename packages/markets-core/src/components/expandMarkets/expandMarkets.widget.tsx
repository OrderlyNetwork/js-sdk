import React from "react";
import { MarketsTabName } from "../../type";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useMarketCategories } from "../shared/hooks/useMarketCategories";
import { tabKey } from "../shared/tabUtils";
import {
  useExpandMarketsScript,
  ExpandMarketsScriptOptions,
} from "./expandMarkets.script";
import { ExpandMarkets, ExpandMarketsProps } from "./expandMarkets.ui";

export type ExpandMarketsWidgetProps = MarketsProviderProps &
  ExpandMarketsScriptOptions &
  Partial<Pick<ExpandMarketsProps, "renderTabContent">>;

/** Slots a host can use to add custom tabs (e.g. Prediction) to the panel. */
export type ExpandMarketsExtensionProps = Pick<
  ExpandMarketsWidgetProps,
  "tabs" | "renderTabContent"
>;

export const ExpandMarketsWidget: React.FC<ExpandMarketsWidgetProps> = (
  props,
) => {
  const state = useExpandMarketsScript({
    activeTab: props.activeTab,
    onTabChange: props.onTabChange,
  });
  const defaultTabs = useMarketCategories("expandMarkets");
  const tabs = props.tabs ?? defaultTabs;
  // Recover when the active tab (e.g. a persisted custom tab removed from the
  // extension) is no longer present in the effective tab set.
  const activeTab = (
    tabs.some((tab, index) => tabKey(tab, index) === state.activeTab)
      ? state.activeTab
      : tabs.length
        ? tabKey(tabs[0], 0)
        : state.activeTab
  ) as MarketsTabName;

  return (
    <MarketsProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
      tabs={tabs}
    >
      <ExpandMarkets
        {...state}
        activeTab={activeTab}
        renderTabContent={props.renderTabContent}
      />
    </MarketsProvider>
  );
};

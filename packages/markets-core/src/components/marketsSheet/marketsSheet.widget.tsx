import React from "react";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useMarketCategories } from "../shared/hooks/useMarketCategories";
import { tabKey } from "../shared/tabUtils";
import { useMarketsSheetScript } from "./marketsSheet.script";
import { MarketsSheet, MarketsSheetProps } from "./marketsSheet.ui";

export type MarketsSheetWidgetProps = MarketsProviderProps &
  Partial<Pick<MarketsSheetProps, "className" | "renderTabContent">> & {
    /** Appends a separate market section after the built-in markets list. */
    renderTabAfterContent?: MarketsSheetProps["renderTabAfterContent"];
    /**
     * Handed to extension renderers as `hide`; sheet hosts own the open
     * state, so closing the sheet is the host's responsibility.
     */
    onRequestClose?: () => void;
  };

/** Slots a host can use to add custom tabs (e.g. Prediction) to the sheet. */
export type MarketsSheetExtensionProps = Pick<
  MarketsSheetWidgetProps,
  "tabs" | "renderTabContent" | "renderTabAfterContent"
>;

const noop = () => {};

export const MarketsSheetWidget: React.FC<MarketsSheetWidgetProps> = (
  props,
) => {
  const state = useMarketsSheetScript();
  const defaultTabs = useMarketCategories("marketsSheet");
  const tabs = props.tabs ?? defaultTabs;
  // Recover when the persisted tab no longer exists (e.g. extension removed).
  const activeTab = tabs.some(
    (tab, index) => tabKey(tab, index) === state.activeTab,
  )
    ? state.activeTab
    : tabs.length
      ? tabKey(tabs[0], 0)
      : state.activeTab;

  return (
    <MarketsProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
      tabs={tabs}
    >
      <MarketsSheet
        {...state}
        activeTab={activeTab}
        className={props.className}
        renderTabContent={props.renderTabContent}
        renderTabAfterContent={props.renderTabAfterContent}
        hide={props.onRequestClose ?? noop}
      />
    </MarketsProvider>
  );
};

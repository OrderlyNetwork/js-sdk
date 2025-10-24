import React from "react";
import { MarketsProvider, type MarketsProviderProps } from "../marketsProvider";
import {
  useSubMenuMarketsScript,
  type SubMenuMarketsScriptOptions,
} from "./subMenuMarkets.script";
import { SubMenuMarkets } from "./subMenuMarkets.ui";
import type { SubMenuMarketsProps } from "./subMenuMarkets.ui";

export type SubMenuMarketsWidgetProps = MarketsProviderProps &
  SubMenuMarketsScriptOptions &
  Pick<SubMenuMarketsProps, "className">;

export const SubMenuMarketsWidget: React.FC<SubMenuMarketsWidgetProps> = (
  props,
) => {
  const state = useSubMenuMarketsScript({
    activeTab: props.activeTab,
    onTabChange: props.onTabChange,
  });

  return (
    <MarketsProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
    >
      <SubMenuMarkets
        activeTab={state.activeTab}
        onTabChange={state.onTabChange}
        tabSort={state.tabSort}
        onTabSort={state.onTabSort}
        className={props.className}
      />
    </MarketsProvider>
  );
};

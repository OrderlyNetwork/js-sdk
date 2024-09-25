import React from "react";
import { useSideMarketsScript } from "./sideMarkets.script";
import { SideMarkets, SideMarketsProps } from "./sideMarkets.ui";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";

export type SideMarketsWidgetProps = MarketsProviderProps &
  Partial<Pick<SideMarketsProps, "collapsed" | "onCollapse">>;

export const SideMarketsWidget: React.FC<SideMarketsWidgetProps> = (props) => {
  const state = useSideMarketsScript({
    collapsed: props.collapsed,
    onCollapse: props.onCollapse,
  });

  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <SideMarkets {...state} />
    </MarketsProvider>
  );
};

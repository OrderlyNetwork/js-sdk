import React from "react";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useSideMarketsScript } from "./sideMarkets.script";
import { SideMarkets, SideMarketsProps } from "./sideMarkets.ui";

export type SideMarketsWidgetProps = MarketsProviderProps &
  Partial<
    Pick<
      SideMarketsProps,
      "collapsable" | "collapsed" | "onCollapse" | "className"
    >
  >;

export const SideMarketsWidget: React.FC<SideMarketsWidgetProps> = (props) => {
  const state = useSideMarketsScript({
    collapsable: props.collapsable,
    collapsed: props.collapsed,
    onCollapse: props.onCollapse,
  });

  return (
    <MarketsProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
    >
      <SideMarkets {...state} className={props.className} />
    </MarketsProvider>
  );
};

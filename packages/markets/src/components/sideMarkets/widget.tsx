import React from "react";
import { useSideMarketsScript } from "./sideMarkets.script";
import { SideMarkets, SideMarketsProps } from "./sideMarkets.ui";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";

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

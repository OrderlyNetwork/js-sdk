import React from "react";
import { useSideMarketsScript } from "./sideMarkets.script";
import { SideMarkets, SideMarketsProps } from "./sideMarkets.ui";
import {
  SideMarketsProvider,
  SideMarketsProviderProps,
} from "../sideMarketsProvider";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";

export type SideMarketsWidgetProps = SideMarketsProviderProps &
  MarketsProviderProps &
  SideMarketsProps;

export const SideMarketsWidget: React.FC<SideMarketsWidgetProps> = (props) => {
  const state = useSideMarketsScript({
    collapsed: props.collapsed,
    onCollapse: props.onCollapse,
  });
  return (
    <SideMarketsProvider>
      <MarketsProvider onSymbolChange={props.onSymbolChange}>
        <SideMarkets {...state} />
      </MarketsProvider>
    </SideMarketsProvider>
  );
};

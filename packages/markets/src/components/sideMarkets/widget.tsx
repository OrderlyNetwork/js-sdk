import React from "react";
import { useSideMarketsScript } from "./sideMarkets.script";
import { SideMarkets } from "./sideMarkets.ui";
import {
  SideMarketsProvider,
  SideMarketsProviderProps,
} from "../sideMarketsProvider";

export type SideMarketsWidgetProps = SideMarketsProviderProps;

export const SideMarketsWidget: React.FC<SideMarketsWidgetProps> = (props) => {
  const state = useSideMarketsScript();
  return (
    <SideMarketsProvider onSymbolChange={props.onSymbolChange}>
      <SideMarkets {...state} />
    </SideMarketsProvider>
  );
};

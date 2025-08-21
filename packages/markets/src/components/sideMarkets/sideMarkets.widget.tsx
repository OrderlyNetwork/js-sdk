import React from "react";
import { pick } from "ramda";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useSideMarketsScript } from "./sideMarkets.script";
import { SideMarkets, SideMarketsProps } from "./sideMarkets.ui";

export type SideMarketsWidgetProps = MarketsProviderProps &
  Partial<
    Pick<
      SideMarketsProps,
      "resizeable" | "panelSize" | "onPanelSizeChange" | "className"
    >
  >;

export const SideMarketsWidget: React.FC<SideMarketsWidgetProps> = (props) => {
  const state = useSideMarketsScript(
    pick(["resizeable", "panelSize", "onPanelSizeChange"], props),
  );
  return (
    <MarketsProvider {...pick(["symbol", "onSymbolChange"], props)}>
      <SideMarkets {...state} className={props.className} />
    </MarketsProvider>
  );
};

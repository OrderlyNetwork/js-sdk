import React from "react";
import { useDropDownMarketsScript } from "./dropDownMarkets.script";
import { DropDownMarkets } from "./dropDownMarkets.ui";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";

export type DropDownMarketsWidgetProps = MarketsProviderProps;

export const DropDownMarketsWidget: React.FC<DropDownMarketsWidgetProps> = (
  props
) => {
  const state = useDropDownMarketsScript();
  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <DropDownMarkets {...state} />
    </MarketsProvider>
  );
};

import React from "react";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useMarketsSheetScript } from "./marketsSheet.script";
import { MarketsSheet, MarketsSheetProps } from "./marketsSheet.ui";

export type MarketsSheetWidgetProps = MarketsProviderProps &
  Partial<Pick<MarketsSheetProps, "className">>;

export const MarketsSheetWidget: React.FC<MarketsSheetWidgetProps> = (
  props,
) => {
  const state = useMarketsSheetScript();

  return (
    <MarketsProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
    >
      <MarketsSheet {...state} className={props.className} />
    </MarketsProvider>
  );
};

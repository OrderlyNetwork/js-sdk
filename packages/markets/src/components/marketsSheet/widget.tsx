import React from "react";
import { useMarketsSheetScript } from "./marketsSheet.script";
import { MarketsSheet, MarketsSheetProps } from "./marketsSheet.ui";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";

export type MarketsSheetWidgetProps = MarketsProviderProps &
  Partial<Pick<MarketsSheetProps, "className">>;

export const MarketsSheetWidget: React.FC<MarketsSheetWidgetProps> = (
  props
) => {
  const state = useMarketsSheetScript();

  return (
    <MarketsProvider onSymbolChange={props.onSymbolChange}>
      <MarketsSheet {...state} className={props.className} />
    </MarketsProvider>
  );
};
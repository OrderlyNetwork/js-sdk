import React from "react";
import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import {
  SymbolLeverageScriptOptions,
  useSymbolLeverageScript,
} from "./leverage.script";
import { SymbolLeverageUI } from "./leverage.ui";

export type SymbolLeverageWidgetProps = {
  close?: () => void;
} & SymbolLeverageScriptOptions;

export const SymbolLeverageWidget: React.FC<SymbolLeverageWidgetProps> = (
  props,
) => {
  const state = useSymbolLeverageScript({
    close: props.close,
    leverageLevers: props.leverageLevers,
    curLeverage: props.curLeverage,
    symbol: props.symbol,
    positionQty: props.positionQty,
  });
  return <SymbolLeverageUI {...state} />;
};

export const SymbolLeverageSheetId = "SymbolLeverageSheetId";
export const SymbolLeverageDialogId = "SymbolLeverageDialogId";

// Register sheet version for mobile
registerSimpleSheet(SymbolLeverageSheetId, SymbolLeverageWidget, {
  title: null,
  classNames: {
    content: "oui-p-5 oui-pt-3",
    body: "!oui-pt-0",
  },
});

// Register dialog version for desktop
registerSimpleDialog(SymbolLeverageDialogId, SymbolLeverageWidget, {
  title: null,
  classNames: {
    content: "oui-p-5 oui-pt-3",
    body: "!oui-pt-0",
  },
});

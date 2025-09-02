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
    close: props?.close,
    leverageLevers: props?.leverageLevers,
    curLeverage: props?.curLeverage,
    symbol: props?.symbol,
  });
  return <SymbolLeverageUI {...state} />;
};

export const AdjustLeverageSheetId = "AdjustLeverageSheetId";
export const AdjustLeverageDialogId = "AdjustLeverageDialogId";

// Register sheet version for mobile
registerSimpleSheet(AdjustLeverageSheetId, SymbolLeverageWidget, {
  title: null,
  classNames: {
    content: "oui-p-5 oui-pt-3",
    body: "!oui-pt-0",
  },
});

// Register dialog version for desktop
registerSimpleDialog(AdjustLeverageDialogId, SymbolLeverageWidget, {
  title: null,
  classNames: {
    content: "oui-p-5 oui-pt-3",
    body: "!oui-pt-0",
  },
});

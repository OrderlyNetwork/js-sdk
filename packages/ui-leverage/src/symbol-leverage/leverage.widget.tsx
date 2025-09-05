import React from "react";
import { i18n } from "@orderly.network/i18n";
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
  const state = useSymbolLeverageScript(props);
  return <SymbolLeverageUI {...state} />;
};

export const SymbolLeverageSheetId = "SymbolLeverageSheetId";
export const SymbolLeverageDialogId = "SymbolLeverageDialogId";

// Register sheet version for mobile
registerSimpleSheet(SymbolLeverageSheetId, SymbolLeverageWidget, {
  title: () => i18n.t("leverage.adjustedLeverage"),
  classNames: {
    // content: "oui-p-5",
  },
});

// Register dialog version for desktop
registerSimpleDialog(SymbolLeverageDialogId, SymbolLeverageWidget, {
  title: () => i18n.t("leverage.adjustedLeverage"),
  classNames: {
    content: "oui-w-[420px]",
  },
});

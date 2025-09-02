import React from "react";
import { i18n } from "@orderly.network/i18n";
import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import { Leverage } from "@orderly.network/ui-leverage";
import {
  SymbolLeverageScriptOptions,
  useSymbolLeverageScript,
} from "./leverage.script";

export type SymbolLeverageWidgetProps = {
  close?: () => void;
} & SymbolLeverageScriptOptions;

export const SymbolLeverageWidget: React.FC<SymbolLeverageWidgetProps> = (
  props,
) => {
  const state = useSymbolLeverageScript({
    close: props?.close,
    leverageLevers: props?.leverageLevers,
    maxLeverage: props?.maxLeverage,
    update: props?.update,
    isLoading: props?.isLoading,
    curLeverage: props?.curLeverage,
  });
  return <Leverage {...state} />;
};

export const AdjustLeverageSheetId = "AdjustLeverageSheetId";
export const AdjustLeverageDialogId = "AdjustLeverageDialogId";

// Register sheet version for mobile
registerSimpleSheet(AdjustLeverageSheetId, SymbolLeverageWidget, {
  title: () => i18n.t("leverage.maxAccountLeverage"),
  classNames: {
    content: "oui-p-4",
  },
});

// Register dialog version for desktop
registerSimpleDialog(AdjustLeverageDialogId, SymbolLeverageWidget, {
  title: () => i18n.t("leverage.maxAccountLeverage"),
  size: "md",
  classNames: {
    content: "oui-p-6",
  },
});

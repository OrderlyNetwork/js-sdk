import React from "react";
import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import { useTPSLSimpleDialog } from "./tpslSimpleDialog.script";
import { TPSLSimpleDialogUI } from "./tpslSimpleDialog.ui";

export const TPSLSimpleDialogWidget: React.FC<{
  type: "tp" | "sl";
  triggerPrice?: number;
  symbol: string;
  close?: () => void;
  onComplete?: () => void;
}> = (props) => {
  const { close, onComplete } = props;
  const state = useTPSLSimpleDialog(props);
  return (
    <TPSLSimpleDialogUI {...state} close={close} onComplete={onComplete} />
  );
};

export const TPSLSimpleSheetId = "TPSLSimpleSheetId";

export const TPSLSimpleDialogId = "TPSLSimpleDialogId";

registerSimpleSheet(TPSLSimpleSheetId, TPSLSimpleDialogWidget, {
  classNames: {},
});

registerSimpleDialog(TPSLSimpleDialogId, TPSLSimpleDialogWidget, {
  classNames: {
    content: "oui-w-[420px]",
  },
});

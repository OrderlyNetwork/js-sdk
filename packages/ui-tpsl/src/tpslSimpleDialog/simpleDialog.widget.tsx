import React from "react";
import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import { TPSLSimpleDialogUI } from "./simpleDialog.ui";

export const TPSLSimpleDialogWidget: React.FC<{
  type: "tp" | "sl";
  triggerPrice?: number;
}> = (props) => {
  return <TPSLSimpleDialogUI {...props} />;
};

export const TPSLSimpleSheetId = "TPSLSimpleSheetId";

export const TPSLSimpleDialogId = "TPSLSimpleDialogId";

console.log("1111111");

registerSimpleSheet(TPSLSimpleSheetId, TPSLSimpleDialogWidget);

registerSimpleDialog(TPSLSimpleDialogId, TPSLSimpleDialogWidget, {
  classNames: {
    content: "oui-w-[420px]",
  },
});

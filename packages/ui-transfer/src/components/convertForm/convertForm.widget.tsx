import React from "react";
import { i18n } from "@orderly.network/i18n";
import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import type { DepositAndWithdrawProps } from "../depositAndWithdraw";
import { useConvertFormScript } from "./convertForm.script";
import { ConvertFormUI } from "./convertForm.ui";

export const ConvertDialogId = "ConvertDialogId";
export const ConverSheetId = "ConverSheetId";

export const ConvertFormWidget: React.FC<DepositAndWithdrawProps> = (props) => {
  const state = useConvertFormScript({ onClose: props.close });
  return <ConvertFormUI {...state} />;
};

registerSimpleDialog(ConvertDialogId, ConvertFormWidget, {
  size: "md",
  classNames: { content: "oui-border oui-border-line-6" },
  title: () => "Convert",
});

registerSimpleSheet(ConverSheetId, ConvertFormWidget, {
  title: () => "Convert",
});

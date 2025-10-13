import React from "react";
// import pick from "ramda/es/pick";
import { i18n } from "@kodiak-finance/orderly-i18n";
import { registerSimpleDialog, registerSimpleSheet } from "@kodiak-finance/orderly-ui";
import type { ConvertFormScriptOptions } from "./convertForm.script";
import { useConvertFormScript } from "./convertForm.script";
import { ConvertFormUI } from "./convertForm.ui";

export const ConvertDialogId = "ConvertDialogId";
export const ConvertSheetId = "ConvertSheetId";

export const ConvertFormWidget: React.FC<ConvertFormScriptOptions> = (
  props,
) => {
  const state = useConvertFormScript(props);
  return <ConvertFormUI {...state} />;
};

registerSimpleDialog(ConvertDialogId, ConvertFormWidget, {
  size: "md",
  classNames: { content: "oui-border oui-border-line-6" },
  title: () => i18n.t("transfer.convert"),
});

registerSimpleSheet(ConvertSheetId, ConvertFormWidget, {
  title: () => i18n.t("transfer.convert"),
});

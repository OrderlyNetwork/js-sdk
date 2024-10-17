import { registerSimpleSheet } from "@orderly.network/ui";
import { type TPSLWidgetProps } from "@orderly.network/ui-tpsl";
import { TPSLSheetUI } from "./tp_sl_sheet.ui";
import { useTPSLSheetScript } from "./tp_sl_sheet.script";
import { TPSLSheetTitle } from "./positionInfo";

export const TP_SL_SheetWidget = (props: TPSLWidgetProps) => {
  const state = useTPSLSheetScript(props);

  return <TPSLSheetUI {...props} {...state} />;
};
export const POSITION_TP_SL_SHEET_ID = "POSITION_TP_SL_SHEET_ID";

registerSimpleSheet(POSITION_TP_SL_SHEET_ID, TP_SL_SheetWidget, {
  title: <TPSLSheetTitle />,
});

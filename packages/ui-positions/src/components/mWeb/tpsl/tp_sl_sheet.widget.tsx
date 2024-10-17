import { type TPSLWidgetProps } from "@orderly.network/ui-tpsl";
import { TPSLSheetUI } from "./tp_sl_sheet.ui";
import { useTPSLSheetScript } from "./tp_sl_sheet.script";

export const TP_SL_SheetWidget = (props: TPSLWidgetProps) => {
  const state = useTPSLSheetScript(props);

  return <TPSLSheetUI {...props} {...state} />;
};

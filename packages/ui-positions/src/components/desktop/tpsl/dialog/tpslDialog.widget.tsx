import { TPSLDialog } from "./tpslDialog.ui";
import { useTPSLEditorBuilder } from "./tpslDialog.script";
import { TPSLWidgetProps } from "../tpsl.widget";

export const TPSLEditorWidget = (props: TPSLWidgetProps) => {
  const state = useTPSLEditorBuilder();
  return <TPSLDialog {...props} {...state} />;
};

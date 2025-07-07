import { i18n } from "@orderly.network/i18n";
import { type AlgoOrderRootType } from "@orderly.network/types";
import { registerSimpleDialog, registerSimpleSheet } from "@orderly.network/ui";
import { TPSL, TPSLProps } from "./tpsl.ui";
import { TPSLBuilderOptions, useTPSLBuilder } from "./useTPSL.script";

export type TPSLWidgetProps = {
  onTPSLTypeChange?: (type: AlgoOrderRootType) => void;
} & TPSLBuilderOptions &
  TPSLProps;

export const TPSLWidget = (props: TPSLWidgetProps) => {
  const { onCancel, onComplete, ...rest } = props;
  const state = useTPSLBuilder(rest);

  return <TPSL {...state} onCancel={onCancel} onComplete={onComplete} />;
};

export const TPSLSheetId = "TPSLSheetId";
export const TPSLDialogId = "TPSLDialogId";

registerSimpleSheet(TPSLSheetId, TPSLWidget);

registerSimpleDialog(TPSLDialogId, TPSLWidget, {
  classNames: {
    content: "oui-w-[420px]",
  },
});

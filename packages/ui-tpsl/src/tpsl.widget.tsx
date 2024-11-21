import { type AlgoOrderRootType } from "@orderly.network/types";
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

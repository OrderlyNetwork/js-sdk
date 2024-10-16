import { TPSL, TPSLProps } from "./tpsl.ui";
import { TPSLBuilderOptions, useTPSLBuilder } from "./useTPSL.script";

export type TPSLWidgetProps = {} & TPSLBuilderOptions & TPSLProps;

export const TPSLWidget = (props: TPSLWidgetProps) => {
  const { onCancel, onComplete, ...rest } = props;
  const state = useTPSLBuilder(rest);
  console.log("TPSLWidget", state);
  return <TPSL {...state} onCancel={onCancel} onComplete={onComplete} />;
};

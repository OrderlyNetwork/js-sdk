import { TPSL, TPSLProps } from "./tpsl.ui";
import { TPSLBuilderOptions, useTPSLBuilder } from "./useTPSL.script";

export type TPSLWidgetProps = {} & TPSLBuilderOptions & TPSLProps;

export const TPSLWidget = (props: TPSLWidgetProps) => {
  const { onCancel, ...rest } = props;
  const state = useTPSLBuilder(rest);
  return <TPSL {...state} onCancel={onCancel} />;
};

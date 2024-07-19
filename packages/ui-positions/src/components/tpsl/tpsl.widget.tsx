import { TPSL } from "./tpsl.ui";
import { TPSLBuilderOptions, useTPSLBuilder } from "./useTPSL.script";

type Props = {} & TPSLBuilderOptions;

export const TPSLWidget = (props: Props) => {
  const state = useTPSLBuilder(props);
  return <TPSL {...state} />;
};

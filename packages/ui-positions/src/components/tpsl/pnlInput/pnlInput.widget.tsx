import { PNLInput } from "./pnlInput.ui";
import { BuilderProps, usePNLInputBuilder } from "./useBuilder.script";

export const PnlInputWidget = (props: BuilderProps) => {
  const state = usePNLInputBuilder(props);
  return <PNLInput {...state} />;
};

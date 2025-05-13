import { FC } from "react";
import {
  useCrossDepositFormScript,
  UseCrossDepositFormScriptOptions,
} from "./crossDepositForm.script";
import { CrossDepositForm } from "./crossDepositForm.ui";

export type CrossDepositFormWidgetProps = UseCrossDepositFormScriptOptions;

export const CrossDepositFormWidget: FC<CrossDepositFormWidgetProps> = (
  props,
) => {
  const state = useCrossDepositFormScript(props);
  return <CrossDepositForm {...state} />;
};

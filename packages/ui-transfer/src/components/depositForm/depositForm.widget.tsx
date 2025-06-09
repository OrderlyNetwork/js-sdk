import { FC } from "react";
import {
  useDepositFormScript,
  UseDepositFormScriptOptions,
} from "./depositForm.script";
import { DepositForm } from "./depositForm.ui";

export type DepositFormWidgetProps = UseDepositFormScriptOptions;

export const DepositFormWidget: FC<DepositFormWidgetProps> = (props) => {
  const state = useDepositFormScript(props);
  return <DepositForm {...state} />;
};

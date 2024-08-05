import {
  useDepositFormScript,
  UseDepositFormScriptOptions,
} from "./depositForm.script";
import { DepositForm } from "./depositForm.ui";

export type DepositFormWidgetProps = UseDepositFormScriptOptions;

export const DepositFormWidget = (props: DepositFormWidgetProps) => {
  const state = useDepositFormScript(props);
  return <DepositForm {...state} />;
};

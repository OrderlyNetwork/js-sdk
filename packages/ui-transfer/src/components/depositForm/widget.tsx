import {
  useDepositFormScript,
  UseDepositFormScriptOptions,
} from "./depositForm.script";
import { DepositForm } from "./depositForm.ui";

export const DepositFormWidget: React.FC<UseDepositFormScriptOptions> = (
  props
) => {
  const state = useDepositFormScript(props);
  console.log("state", state);
  return <DepositForm {...state} />;
};

import {
  useDepositFormScript,
  UseDepositFormScriptOptions,
} from "./depositForm.script";
import { DepositForm } from "./depositForm.ui";

export const DepositFormWidget: React.FC<UseDepositFormScriptOptions> = (
  props
) => {
  const state = useDepositFormScript(props);
  return <DepositForm {...state} />;
};

import { useCrossDepositFormScript } from "./crossDepositForm.script";
import { CrossDepositForm } from "./crossDepositForm.ui";

export const CrossDepositFormWidget = () => {
  const state = useCrossDepositFormScript();
  return <CrossDepositForm {...state} />;
};

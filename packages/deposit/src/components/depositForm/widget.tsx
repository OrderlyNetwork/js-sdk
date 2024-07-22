import { useDepositFormScript } from "./depositForm.script";
import { DepositForm } from "./depositForm.ui";

export const DepositFormWidget = () => {
  const state = useDepositFormScript();
  return <DepositForm {...state} />;
};

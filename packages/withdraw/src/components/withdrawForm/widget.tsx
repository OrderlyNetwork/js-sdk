import { useWithdrawFormScript } from "./withdrawForm.script";
import { WithdrawForm } from "./withdrawForm.ui";

export const WithdrawFormWidget = () => {
  const state = useWithdrawFormScript();
  return <WithdrawForm {...state} />;
};

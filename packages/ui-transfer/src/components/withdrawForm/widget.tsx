import { WithdrawFormUI } from "./withdrawForm.ui";
import { useWithdrawForm } from "./withdrawForm.script";
import { DepositAndWithdrawProps } from "../depositAndWithdraw";

export const WithdrawFormWidget = (dialogProps: DepositAndWithdrawProps) => {
  const props = useWithdrawForm({
    onClose: dialogProps.close,
  });
  return <WithdrawFormUI {...props} />;
};

import { DepositAndWithdrawProps } from "../depositAndWithdraw";
import { useWithdrawFormScript } from "./withdrawForm.script";
import { WithdrawForm } from "./withdrawForm.ui";

export const WithdrawFormWidget = (dialogProps: DepositAndWithdrawProps) => {
  const props = useWithdrawFormScript({
    onClose: dialogProps.close,
  });
  return <WithdrawForm {...props} />;
};

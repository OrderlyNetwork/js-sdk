import {WithdrawFormUI} from "./ui";
import {useWithdrawForm} from "./script";
import {DepositAndWithdrawProps} from "../depositAndWithdraw";

export const WithdrawFormWidget = (dialogProps: DepositAndWithdrawProps) => {
    const props = useWithdrawForm({
        onClose: dialogProps.close,
    });
    return (
        <WithdrawFormUI {...props} />
    )

}
import { Box } from "@orderly.network/ui"
import {WithdrawFormUI} from "./ui";
import {useWithdrawForm} from "./script";

export const WithdrawFormWidget = () => {
    const props = useWithdrawForm();
    return (
        <WithdrawFormUI {...props}/>
    )

}
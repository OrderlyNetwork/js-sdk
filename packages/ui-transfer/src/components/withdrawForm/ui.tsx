import {Box, textVariants} from "@orderly.network/ui"
import {UseWithdrawFormScriptReturn} from "./script";
import {Web3Wallet} from "../web3Wallet";

export const WithdrawFormUI = (
    {
        walletName, address
    }: UseWithdrawFormScriptReturn
) => {
    return (
        <Box id="oui-withdraw-form" className={textVariants({weight: "semibold"})}>
            <Web3Wallet name={walletName} address={address} />

        </Box>
    )
}
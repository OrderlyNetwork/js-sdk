import {useMemo} from "react";
import {useWalletConnector} from "@orderly.network/hooks";

export type UseWithdrawFormScriptReturn = ReturnType<typeof useWithdrawForm>

export const useWithdrawForm = () => {
    const {
        connectedChain,
        wallet,
        setChain: switchChain,
        settingChain,
    } = useWalletConnector();
    const { walletName, address } = useMemo(
        () => ({
            walletName: wallet?.label,
            address: wallet?.accounts?.[0].address,
        }),
        [wallet]
    );
    return {
        walletName,
        address,

    }
}
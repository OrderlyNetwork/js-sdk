import {Box, Flex } from "@orderly.network/ui"
import {useAppContext} from "@orderly.network/react-app";
import {useMemo} from "react";
import { Decimal } from "@orderly.network/utils";
import {API} from "@orderly.network/types/src";

interface IProps{
    quantity: string;
    chainVaultBalance: number;
    currentChain: any;
    maxAmount: number;
    crossChainTrans: boolean;
}

export const WithdrawWarningMessage = ({quantity, chainVaultBalance, currentChain, maxAmount, crossChainTrans}: IProps) => {
    const { wrongNetwork } = useAppContext();

    const networkName = useMemo(() => {
        if (currentChain && currentChain.info && currentChain.info.network_infos) {
            return currentChain.info.network_infos.name;
        }
        return undefined;


    }, [currentChain])

    const showVaultWarning = useMemo(() => {
        if (!chainVaultBalance) {
           return false;
        }
        if (!maxAmount) {
           return false;
        }
        if (!quantity) {
            return false;
        }
        if (new Decimal(quantity).gt(maxAmount)) {
            return false;
        }
        if (new Decimal(quantity).gt(chainVaultBalance)) {
            return true;
        }
        return false;

    }, [quantity, chainVaultBalance])

    const renderContent = () => {

        if (wrongNetwork) {
            return (
                <Box>
                    Withdrawals are not supported on {networkName ?? "this chain"}. Please switch to any of the bridgeless networks.
                </Box>
            )
        }
        if (crossChainTrans) {
            return `Your cross-chain withdrawal is being processed...`;
        }
        if (showVaultWarning) {
            return `Withdrawal exceeds the balance of the ${networkName} vault ( ${chainVaultBalance} USDC ). Cross-chain rebalancing fee will be charged for withdrawal to ${networkName}.`
        }
    }

    return (
        <Flex className='oui-text-warning oui-text-xs oui-text-center'>
            {renderContent()}
        </Flex>
    )
}
import { Flex } from "@orderly.network/ui"
import {useAppContext} from "@orderly.network/react-app";

export const WithdrawWarningMessage = () => {
    const { wrongNetwork } = useAppContext();


    return (
        <Flex className='oui-text-warning oui-text-xs oui-text-center'>
            {wrongNetwork && 'Withdrawals are currently not supported on BNB Chains. Please switch to the Arbitrum network for withdrawals. '}
            waring message
        </Flex>
    )
}
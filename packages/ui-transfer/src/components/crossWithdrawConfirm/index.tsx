import {Box, ChainIcon, Flex, Text} from "@orderly.network/ui"
import {useMemo} from "react";

interface IProps {
    currentChain: any;
    amount: number;
    address: string;

}

export const CrossWithdrawConfirm = ({address, amount, currentChain}: IProps) => {
    const networkName = useMemo(() => {
        if (currentChain && currentChain.info && currentChain.info.network_infos) {
            return currentChain.info.network_infos.name;
        }
        return undefined;


    }, [currentChain]) ;
    return (
        <Flex direction='column' itemAlign='start' justify='start' gap={3}>
            <Flex direction='column' itemAlign='start' gap={3} mb={5}>
                <Flex direction="column" justify='start' itemAlign='start'>
                    <Text size='2xs' intensity={36}>
                        Recipient address
                    </Text>
                    <Text size='sm' intensity={98}>
                        {address}
                    </Text>
                </Flex>
                <Flex direction="column" justify='start' itemAlign='start'>
                    <Text size='2xs' intensity={36}>
                        Recipient network
                    </Text>
                    <Flex gap={1}>
                        <ChainIcon className='oui-h-[18px] oui-w-[18px]' size={'sm'} chainId={currentChain.id}/>

                        <Text size='sm' intensity={98}>
                            {networkName}
                        </Text>
                    </Flex>
                </Flex>
                <Flex direction="column" justify='start' itemAlign='start'>
                    <Text size='2xs' intensity={36}>
                        Withdraw amount (USDC)
                    </Text>
                    <Text.numeral size='sm' intensity={98} dp={2}>
                        {amount}
                    </Text.numeral>
                </Flex>

            </Flex>
            <Flex justify='center' className='oui-text-warning  oui-text-xs oui-text-center'>
                Withdrawals that require cross-chain rebalancing can't be cancelled or followed up with more withdrawals
                until they've been processed.
            </Flex>

        </Flex>
    )
}
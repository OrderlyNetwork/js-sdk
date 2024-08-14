import {Box, Button, Flex, modal, Text, toast} from "@orderly.network/ui";
import {useAccount} from "@orderly.network/hooks";
import { ChainSelectorId } from "@orderly.network/ui-chain-selector";
import { AccountStatusEnum, NetworkId } from "@orderly.network/types";

interface IProps{
    networkId?:NetworkId;
}
export default function SwitchChainButton(props:IProps) {
    const { account } = useAccount();
    const switchChain = () => {

        modal
            .show<{
                wrongNetwork: boolean;
            }>(ChainSelectorId, {
                networkId: props.networkId,
                bridgeLessOnly: true,
            })
            .then(
                (r) => {
                    toast.success("Network switched");

                },
                (error) => console.log("[switchChain error]", error)
            );
    };


    return (

        <Flex direction={"column"}>
            <Button
                color="warning"
                // size="md"
                // fullWidth
                onClick={() => {
                    switchChain();
                }}
            >
                Switch Network
            </Button>

        </Flex>
    )
}
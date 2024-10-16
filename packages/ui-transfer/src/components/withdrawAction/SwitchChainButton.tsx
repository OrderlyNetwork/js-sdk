import { Button, ButtonProps, Flex, modal, toast } from "@orderly.network/ui";
import { ChainSelectorId } from "@orderly.network/ui-chain-selector";
import { NetworkId } from "@orderly.network/types";

interface IProps {
  networkId?: NetworkId;
  size: ButtonProps["size"];
}

export default function SwitchChainButton(props: IProps) {
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
        size={props.size}
        fullWidth
        onClick={() => {
          switchChain();
        }}
      >
        Switch Network
      </Button>
    </Flex>
  );
}

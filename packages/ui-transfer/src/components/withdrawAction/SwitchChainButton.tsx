import { Button, ButtonProps, Flex, modal, toast } from "@veltodefi/ui";
import { ChainSelectorDialogId } from "@veltodefi/ui-chain-selector";
import { NetworkId } from "@veltodefi/types";
import { useTranslation } from "@veltodefi/i18n";
interface IProps {
  networkId?: NetworkId;
  size: ButtonProps["size"];
}

export default function SwitchChainButton(props: IProps) {
  const { t } = useTranslation();

  const switchChain = () => {
    modal
      .show<{
        wrongNetwork: boolean;
      }>(ChainSelectorDialogId, {
        networkId: props.networkId,
        bridgeLessOnly: true,
      })
      .then(
        (r) => {
          toast.success(t("connector.networkSwitched"));
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
        {t("connector.switchNetwork")}
      </Button>
    </Flex>
  );
}

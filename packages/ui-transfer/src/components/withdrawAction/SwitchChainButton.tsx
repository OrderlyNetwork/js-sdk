import { Button, ButtonProps, Flex, modal, toast } from "@kodiak-finance/orderly-ui";
import { ChainSelectorDialogId } from "@kodiak-finance/orderly-ui-chain-selector";
import { NetworkId } from "@kodiak-finance/orderly-types";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
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

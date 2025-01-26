import { AccountStatusEnum, NetworkId } from "@orderly.network/types";
import { Button, Flex, modal, Select, Tooltip } from "@orderly.network/ui";
import { ChainSelectorId } from "@orderly.network/ui-chain-selector";
import { WalletConnectorModalId } from "@orderly.network/ui-connector";

type ChainItem = {
  name: string;
  id: number;
  lowestFee?: boolean;
  isTestnet?: boolean;
};

export const ChainMenu = (props: {
  chains: {
    mainnet: ChainItem[];
    testnet: ChainItem[];
  };
  onChange?: (chain: ChainItem) => Promise<any>;
  // currentChain?: ChainItem;
  currentChainId?: number;
  wrongNetwork: boolean;
  isConnected: boolean;
  accountStatus: AccountStatusEnum;
  storageChains?: ChainItem[];
  networkId: NetworkId;
}) => {
  if (props.wrongNetwork && props.isConnected) {
    return (
      <Tooltip
        open
        hideWhenDetached
        content={"Please switch to a supported network to continue."}
        className="oui-bg-base-5"
        arrow={{ className: "oui-fill-base-5" }}
      >
        <Button
          color="warning"
          size="md"
          onClick={() => {
            modal
              .show<{
                wrongNetwork: boolean;
              }>(ChainSelectorId, {
                networkId: props.networkId,
                classNames: {
                  body: "!oui-pt-0",
                },
              })
              .then(
                (r) => {
                  if (
                    !r.wrongNetwork &&
                    props.accountStatus < AccountStatusEnum.EnableTrading
                  ) {
                    modal.show(WalletConnectorModalId).then(
                      (r) => console.log(r),
                      (error) => console.log(error)
                    );
                  }
                },
                (error) => console.log(error)
              );
          }}
        >
          Wrong network
        </Button>
      </Tooltip>
    );
  }

  return (
    <Flex justify={"center"}>
      {/* @ts-ignore */}
      <Select.chains
        chains={props.chains}
        size="md"
        value={props.currentChainId}
        variant="contained"
        onChange={props.onChange}
        storageChains={props.storageChains}
      />
    </Flex>
  );
};

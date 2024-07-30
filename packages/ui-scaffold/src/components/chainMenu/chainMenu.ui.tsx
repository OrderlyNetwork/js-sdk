import { Button, Flex, modal, Select, Tooltip } from "@orderly.network/ui";
import { ChainSelectorId } from "@orderly.network/ui-chain-selector";

type ChainItem = {
  name: string;
  id: number;
  lowestFee?: boolean;
};

export const ChainMenu = (props: {
  chains: {
    mainnet: ChainItem[];
    testnet: ChainItem[];
  };
  onChange?: (chain: ChainItem) => Promise<any>;
  currentChain?: ChainItem;
  wrongNetwork: boolean;
  isConnected: boolean;
}) => {
  if (props.wrongNetwork && props.isConnected) {
    return (
      <Tooltip
        open
        content={"Please switch to a supported network to continue."}
      >
        <Button
          color="warning"
          size="md"
          onClick={() => {
            modal.show(ChainSelectorId).then(
              (r) => console.log(r),
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
        value={props.currentChain}
        variant="contained"
        onChange={props.onChange}
      />
    </Flex>
  );
};

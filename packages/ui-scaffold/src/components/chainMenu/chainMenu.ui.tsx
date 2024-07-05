import { Box, Flex, Select } from "@orderly.network/ui";

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
  onChange?: (chain: ChainItem) => void;
  currentChain: ChainItem;
}) => {
  return (
    <Flex justify={"center"}>
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

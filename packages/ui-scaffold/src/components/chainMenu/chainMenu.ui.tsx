import { Box, Flex, Select } from "@orderly.network/ui";

type ChainItem = {
  name: string;
  id: string;
  lowestFee?: boolean;
};

export const ChainMenu = (props: {
  chains: {
    mainnet: ChainItem[];
    testnet: ChainItem[];
  };
  currentChain: ChainItem;
}) => {
  return (
    <Flex justify={"center"}>
      <Select.chains
        chains={props.chains}
        size="md"
        value={props.currentChain}
      />
    </Flex>
  );
};

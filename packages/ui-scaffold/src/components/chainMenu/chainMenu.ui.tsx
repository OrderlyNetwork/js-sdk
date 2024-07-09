import {
  Box,
  Button,
  ChainIcon,
  Flex,
  modal,
  Select,
  Text,
  TriggerDialog,
} from "@orderly.network/ui";

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
  currentChain: ChainItem;
  isSupported: boolean;
}) => {
  console.log("_________________", props);

  if (!props.isSupported) {
    return (
      <Button
        color="warning"
        size="md"
        onClick={() => {
          modal
            .show("SwitchChain", {
              chains: props.chains,
              onChange: props.onChange,
            })
            .then(
              (r) => console.log(r),
              (error) => console.log(error)
            );
        }}
      >
        Wrong network
      </Button>
    );
  }

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

export const NotSupportedDialog = (props: {
  chains: {
    mainnet: ChainItem[];
    testnet: ChainItem[];
  };
  onChange?: (chain: ChainItem) => void;
}) => {
  return (
    <>
      <Box intensity={900} r="2xl" p={1}>
        {/* <Text as="div" className="oui-px-4">
          mainnet
        </Text> */}
        {props.chains.mainnet.map((item, index) => {
          return <ChainItem key={index} {...item} onClick={props.onChange} />;
        })}
        {props.chains.testnet.map((item, index) => {
          return <ChainItem key={item.id} {...item} onClick={props.onChange} />;
        })}
      </Box>
      <Box pt={5} pb={4} className="oui-text-center">
        <Text color="warning">
          Please switch to a supported network to continue.
        </Text>
      </Box>
    </>
  );
};

const ChainItem = (props: {
  id: number;
  name: string;
  lowestFee?: boolean;
  onClick?: (chain: ChainItem) => void;
}) => {
  return (
    <button
      className="oui-w-full"
      onClick={() => {
        props.onClick?.({
          id: props.id,
          name: props.name,
        });
      }}
    >
      <Flex itemAlign={"center"} width={"100%"} py={3} px={4} gap={2}>
        <ChainIcon chainId={props.id} />
        <Text size="2xs">{props.name}</Text>
        {props.lowestFee && (
          <div className="oui-text-success oui-px-2 oui-bg-success/10 oui-rounded oui-text-2xs">
            lowest fee
          </div>
        )}
      </Flex>
    </button>
  );
};

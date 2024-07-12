import {
  Box,
  Button,
  ChainIcon,
  Flex,
  modal,
  Select,
  Text,
  Tooltip,
  TriggerDialog,
} from "@orderly.network/ui";
import { useState } from "react";

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
  isUnsupported: boolean;
  isConnected: boolean;
}) => {
  if (props.isUnsupported && props.isConnected) {
    return (
      <Tooltip
        open
        content={"Please switch to a supported network to continue."}
      >
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

// ------------------ NotSupportedDialog start ------------------
export const NotSupportedDialog = (props: {
  chains: {
    mainnet: ChainItem[];
    testnet: ChainItem[];
  };
  onChange?: (chain: ChainItem) => Promise<any>;
  close: () => void;
}) => {
  const [select, setSelect] = useState<number | undefined>();
  const onChange = async (chain: ChainItem) => {
    setSelect(chain.id);
    const complete = await props.onChange?.(chain);
    if (complete) {
      props.close();
    } else {
      setSelect(undefined);
    }
  };

  return (
    <>
      <Box intensity={900} r="2xl" p={1}>
        <Text as="div" className="oui-px-4 oui-pt-2" intensity={54}>
          mainnet
        </Text>
        {props.chains.mainnet.map((item, index) => {
          return (
            <ChainItem
              key={index}
              selected={select === item.id}
              {...item}
              onClick={(chain: ChainItem) => onChange(chain)}
            />
          );
        })}
        <Text as="div" className="oui-px-4" intensity={54}>
          testnet
        </Text>
        {props.chains.testnet.map((item, index) => {
          return (
            <ChainItem
              key={item.id}
              selected={select === item.id}
              {...item}
              onClick={(chain: ChainItem) => onChange(chain)}
            />
          );
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

// ------------------ ChainItem start ------------------
const ChainItem = (props: {
  id: number;
  name: string;
  lowestFee?: boolean;
  selected: boolean;
  onClick?: (chain: ChainItem) => void;
}) => {
  return (
    <button
      className={
        props.selected
          ? "oui-w-full oui-bg-base-6 oui-rounded-lg hover:oui-bg-base-6"
          : "oui-w-full oui-rounded-lg hover:oui-bg-base-6 "
      }
      onClick={() => {
        props.onClick?.({
          id: props.id,
          name: props.name,
        });
      }}
    >
      <Flex justify={"between"}>
        <Flex itemAlign={"center"} width={"100%"} py={3} px={4} gap={2}>
          <ChainIcon chainId={props.id} />
          <Text size="2xs">{props.name}</Text>
          {props.lowestFee && (
            <div className="oui-text-success oui-px-2 oui-bg-success/10 oui-rounded oui-text-2xs">
              lowest fee
            </div>
          )}
        </Flex>
        {props.selected && (
          <Box
            gradient={"brand"}
            r={"full"}
            width={"6px"}
            height={"6px"}
            mr={4}
          />
        )}
      </Flex>
    </button>
  );
};

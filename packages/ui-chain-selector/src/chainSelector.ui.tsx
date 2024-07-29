import { useState } from "react";
import { Box, Flex, Text, ChainIcon } from "@orderly.network/ui";
import type { ChainItem } from "./types";

//------------------ ChainSelector start ------------------
export const ChainSelector = (props: {
  chains: {
    mainnet: ChainItem[];
    testnet: ChainItem[];
  };
  onChainChange?: (chain: ChainItem) => Promise<any>;
  currentChainId?: number;
  close?: () => void;
}) => {
  const [select, setSelect] = useState<number | undefined>();
  // props.currentChainId
  const onChange = async (chain: ChainItem) => {
    setSelect(chain.id);
    const complete = await props.onChainChange?.(chain);
    if (complete) {
      props.close?.();
    } else {
      setSelect(undefined);
    }
  };

  return (
    <>
      <Box intensity={900} r="2xl" p={1}>
        <Text as="div" className="oui-px-4 oui-pt-2" intensity={54} size="2xs">
          mainnet
        </Text>
        {props.chains.mainnet.map((item, index) => {
          return (
            <ChainTile
              key={index}
              selected={select === item.id}
              {...item}
              onClick={(chain: ChainItem) => onChange(chain)}
            />
          );
        })}
        <Text as="div" className="oui-px-4" intensity={54} size="2xs">
          testnet
        </Text>
        {props.chains.testnet.map((item, index) => {
          return (
            <ChainTile
              key={item.id}
              selected={select === item.id}
              {...item}
              onClick={(chain: ChainItem) => onChange(chain)}
            />
          );
        })}
      </Box>
      <Box pt={5} pb={4} className="oui-text-center">
        <Text color="warning" size="xs">
          Please switch to a supported network to continue.
        </Text>
      </Box>
    </>
  );
};
// ------------------ ChainSelector end ------------------

// ------------------ ChainItem start ------------------
export const ChainTile = (props: {
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

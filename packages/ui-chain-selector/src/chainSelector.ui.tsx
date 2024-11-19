import { useState } from "react";
import { Box, Flex, Text, ChainIcon } from "@orderly.network/ui";
import type { ChainItem } from "./types";

//------------------ ChainSelector start ------------------
export const ChainSelector = (props: {
  chains: {
    mainnet?: ChainItem[];
    testnet?: ChainItem[];
  };
  onChainChange?: (chain: ChainItem) => Promise<any>;
  currentChainId?: number;
  close?: () => void;
  resolve?: (isSuccess: boolean) => void;
  chainChangedCallback?: (
    chainId: number,
    state: {
      isTestnet: boolean;
      isWalletConnected: boolean;
    }
  ) => void;
  isWrongNetwork?: boolean;
}) => {
  const { isWrongNetwork = true } = props;
  const [select, setSelect] = useState<number | undefined>(props.currentChainId);
  // props.currentChainId
  const onChange = async (chain: ChainItem) => {
    setSelect(chain.id);
    const complete = await props.onChainChange?.(chain);

    if (complete) {
      props.resolve?.(complete);
      props.close?.();

      props.chainChangedCallback?.(chain.id, {
        isTestnet: chain.isTestnet ?? false,
        isWalletConnected: true,
      });
    } else {
      setSelect(undefined);
    }
  };

  return (
    <>
      <Box intensity={900} r="2xl" p={1} className="oui-overflow-auto oui-max-h-[463px] xl:oui-max-h-[562px] oui-hide-scrollbar">
        {Array.isArray(props.chains.mainnet) && (
          <Text
            as="div"
            className="oui-px-4 oui-pt-2"
            intensity={54}
            size="2xs"
          >
            Mainnet
          </Text>
        )}

        {props.chains.mainnet?.map((item, index) => {
          return (
            <ChainTile
              key={index}
              selected={select === item.id}
              // {...item}
              item={item}
              onClick={(chain: ChainItem) => onChange(chain)}
            />
          );
        })}
        {Array.isArray(props.chains.testnet) && (
          <Text as="div" className="oui-px-4" intensity={54} size="2xs">
            Testnet
          </Text>
        )}
        {props.chains.testnet?.map((item, index) => {
          return (
            <ChainTile
              key={item.id}
              selected={select === item.id}
              // {...item}
              onClick={(chain: ChainItem) => onChange(chain)}
              item={item}
            />
          );
        })}
      </Box>
      {isWrongNetwork && (
        <Box pt={5} pb={4} className="oui-text-center">
          <Text color="warning" size="xs">
            Please switch to a supported network to continue.
          </Text>
        </Box>
      )}
    </>
  );
};
// ------------------ ChainSelector end ------------------

// ------------------ ChainItem start ------------------
export const ChainTile = (props: {
  // id: number;
  // name: string;
  // lowestFee?: boolean;
  selected: boolean;
  item: ChainItem;
  onClick?: (chain: ChainItem) => void;
}) => {
  const { item } = props;
  return (
    <button
      className={
        props.selected
          ? "oui-w-full oui-bg-base-6 oui-rounded-lg hover:oui-bg-base-6"
          : "oui-w-full oui-rounded-lg hover:oui-bg-base-6 "
      }
      onClick={() => {
        props.onClick?.(item);
      }}
    >
      <Flex justify={"between"}>
        <Flex itemAlign={"center"} width={"100%"} py={3} px={4} gap={2}>
          <ChainIcon chainId={item.id} />
          <Text size="2xs">{item.name}</Text>
          {item.lowestFee && (
            <div className="oui-text-success oui-px-2 oui-bg-success/20 oui-rounded oui-text-2xs">
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

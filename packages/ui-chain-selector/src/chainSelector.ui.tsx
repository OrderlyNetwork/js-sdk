import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  ChainIcon,
  Tabs,
  TabPanel,
  TabsList,
} from "@orderly.network/ui";
import type { ChainItem } from "./types";
import { ChainSelectorType } from "./types";

//------------------ ChainSelector start ------------------
export const ChainSelector = (props: {
  chains: {
    mainnet?: ChainItem[];
    testnet?: ChainItem[];
  };
  storageChains?: ChainItem[];
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
  const [select, setSelect] = useState<number | undefined>(
    props.currentChainId
  );
  const [selectedTab, setSelectedTab] = useState<ChainSelectorType>(
    ChainSelectorType.Mainnet
  );

  useEffect(() => {
    if (props.currentChainId) {
      const isMainnet = props.chains.mainnet?.some(
        (chain) => chain.id === props.currentChainId
      );
      const isTestnet = props.chains.testnet?.some(
        (chain) => chain.id === props.currentChainId
      );
      if (isMainnet) {
        setSelectedTab(ChainSelectorType.Mainnet);
      } else if (isTestnet) {
        setSelectedTab(ChainSelectorType.Testnet);
      }
    }
  }, [props.currentChainId, props.chains]);

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

  const onTabChange = (tab: ChainSelectorType) => {
    setSelectedTab(tab);
  };

  return (
    <>
      <Box intensity={900} className="oui-bg-base-8">
        <Tabs
          value={selectedTab}
          variant="contained"
          size="sm"
          classNames={{
            tabsList: "oui-mt-3",
          }}
          onValueChange={(e) => onTabChange(e as ChainSelectorType)}
        >
          <TabPanel
            value={ChainSelectorType.Mainnet}
            title={ChainSelectorType.Mainnet}
          >
            {props.storageChains?.length ? (
              <Flex gap={2} className="oui-text-center oui-my-3">
                {props.storageChains?.map((item) => {
                  return (
                    <RecommandChain
                      item={item}
                      key={item.id}
                      selected={select === item.id}
                      onClick={(chain: ChainItem) => onChange(chain)}
                    />
                  );
                })}
              </Flex>
            ) : null}
            <Box
              r="2xl"
              p={1}
              className="oui-bg-base-9 oui-mt-3 oui-overflow-auto oui-max-h-[562px] xl:oui-max-h-[500px] oui-hide-scrollbar "
            >
              {props.chains.mainnet?.map((item, index) => {
                return (
                  <ChainTile
                    key={item.id}
                    selected={select === item.id}
                    // {...item}
                    item={item}
                    onClick={(chain: ChainItem) => onChange(chain)}
                  />
                );
              })}
            </Box>
          </TabPanel>

          <TabPanel
            value={ChainSelectorType.Testnet}
            title={ChainSelectorType.Testnet}
          >
            <Box r="2xl" p={1} className="oui-bg-base-9 oui-mt-3">
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
          </TabPanel>
        </Tabs>
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
          {/* {item.lowestFee && (
            <div className="oui-text-success oui-px-2 oui-bg-success/20 oui-rounded oui-text-2xs">
              lowest fee
            </div>
          )} */}
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

// ------------------ Recommand Chain start ------------------
export const RecommandChain = (props: {
  selected: boolean;
  item: ChainItem;
  onClick?: (chain: ChainItem) => void;
}) => {
  const { item } = props;
  return (
    <button
      className={
        props.selected
          ? "oui-border oui-border-line-12 oui-rounded-md oui-border-primary-light"
          : "oui-border oui-border-line-12 oui-rounded-md hover:oui-border-primary-light"
      }
      onClick={() => {
        props.onClick?.(item);
      }}
    >
      <Flex justify={"between"}>
        <Flex itemAlign={"center"} width={"100%"} p={2} gap={1}>
          <ChainIcon chainId={item.id} className="oui-w-[18px] oui-h-[18px]" />
        </Flex>
      </Flex>
    </button>
  );
};

import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React, { useCallback, useState } from "react";
import { ChainListView } from ".";

import {
  useAccount,
  useChains,
  useOrderEntry_deprecated,
} from "@orderly.network/hooks";
import { ChainSelect } from "./chainSelect";
import { modal } from "@/modal";
import { ChainDialog } from "./chainDialog";
import { ChainListViewProps } from "./chainListView";
import { useWalletConnector } from "@orderly.network/hooks";

const meta: Meta = {
  title: "Block/ChainPicker",
  component: ChainSelect,
  argTypes: {
    onValueChange: { action: "onValueChange" },
  },

  args: {
    value: {
      id: 421613,
      chainInfo: {
        chainId: "0x66eed",
        chainName: "Arbitrum Goerli",
        nativeCurrency: {
          name: "AGOR",
          symbol: "AGOR",
          decimals: 18,
          fix: 4,
        },
        rpcUrls: ["https://goerli-rollup.arbitrum.io/rpc"],
        blockExplorerUrls: ["https://goerli-rollup-explorer.arbitrum.io/"],
      },
      minGasBalance: 0.0002,
      minCrossGasBalance: 0.002,
      maxPrepayCrossGas: 0.03,
      blockExplorerName: "Base",
      chainName: "Arbitrum Goerli",
      chainNameShort: "Arbitrum Goerli",
      requestRpc: "https://goerli-rollup.arbitrum.io/rpc",
      chainLogo: "",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ChainSelect>;

export const Default: Story = {};

export const ListView: Story = {
  render: (args) => {
    const [chains] = useChains(undefined, {
      pick: "network_infos",
    });
    return (
      <ChainListView
        mainChains={(chains as any)?.mainnet}
        testChains={(chains as any)?.testnet}
      />
    );
  },
};

export const Dialog: Story = {
  render: (args) => {
    const { state } = useAccount();

    const [chains] = useChains(undefined, {
      pick: "network_infos",
    });

    const { setChain } = useWalletConnector();

    const openChainPicker = useCallback(async () => {
      const result = await modal.show<
        { id: number; name: string },
        ChainListViewProps
      >(ChainDialog, {
        testChains: chains?.testnet,
        mainChains: chains?.mainnet,
        // currentChainId: chain?.id,
        onItemClick: (value) => {
          return setChain({
            chainId: value.id,
            // chainName: value.name,
          });
        },
      });
      console.log("*******", result);
    }, [chains]);

    return <button onClick={openChainPicker}>Switch chain</button>;
  },
};

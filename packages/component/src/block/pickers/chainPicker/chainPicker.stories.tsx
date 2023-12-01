import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React, { useState } from "react";
import { ChainListView } from ".";

import { useChains, useOrderEntry } from "@orderly.network/hooks";
import { ChainSelect } from "./chainSelect";

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
      wooSwapEnabled: false,
    });
    return (
      <ChainListView
        mainChains={chains?.mainnet}
        testChains={chains?.testnet}
      />
    );
  },
};

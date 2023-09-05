import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React, { useState } from "react";
import { ChainPicker } from ".";

import { useChains, useOrderEntry } from "@orderly.network/hooks";
import { MemoryConfigStore, Web3WalletAdapter } from "@orderly.network/core";

import { OrderSide } from "@orderly.network/types";
import { OrderlyProvider } from "../../../provider";
import { WooKeyStore } from "../../../stories/mock/woo.keystore";

const meta: Meta = {
  title: "Block/ChainPicker",
  component: ChainPicker,
  argTypes: {},
  decorators: [
    (Story) => (
      <OrderlyProvider
        configStore={new MemoryConfigStore()}
        keyStore={new WooKeyStore("testnet")}
        walletAdapter={new Web3WalletAdapter()}
      >
        <Story />
      </OrderlyProvider>
    ),
  ],
  args: {},
};

export default meta;

type Story = StoryObj<typeof ChainPicker>;

export const Default: Story = {};

export const WithHooks: Story = {
  render: (args, { globals }) => {
    const [mainnetChains] = useChains("mainnet", "network_infos");
    const [testnetChains] = useChains("testnet", "network_infos");

    console.log("chains", mainnetChains, testnetChains);

    return (
      <ChainPicker mainnetChains={mainnetChains} testChains={testnetChains} />
    );
  },
};

export const WithSheet: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;

    return <ChainPicker mainnetChains={[]} testChains={[]} />;
  },
};

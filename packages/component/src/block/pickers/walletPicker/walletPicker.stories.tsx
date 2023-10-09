import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { WalletPicker } from "./index";
import { useChains } from "@orderly.network/hooks";

const meta: Meta<typeof WalletPicker> = {
  component: WalletPicker,
  title: "Block/WalletPicker",
  argTypes: {
    // onChange: { action: "onChange" },
  },
  args: {
    chain: {
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

type Story = StoryObj<typeof WalletPicker>;

export const Default: Story = {};

export const withHook: Story = {
  render: (args) => {
    const [chains] = useChains();

    console.log(chains);

    return <WalletPicker {...args} />;
  },
};

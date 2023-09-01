import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { TradingPage } from ".";
import { OrderlyProvider } from "../../provider";
import { MemoryConfigStore } from "@orderly.network/core";
import { useAppState } from "@orderly.network/hooks";
import { Page } from "../../layout";
import { WooKeyStore } from "../../stories/mock/woo.keystore";

const meta: Meta = {
  title: "Page/Trading",
  component: TradingPage,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    symbol: {
      // control: 'text'
      control: "select",
      options: ["BTC/USDT", "ETH/USDT"],
    },
  },
  decorators: [
    (Story) => (
      <OrderlyProvider
        configStore={new MemoryConfigStore()}
        walletAdapter={undefined}
        keyStore={new WooKeyStore("testnet")}
        logoUrl="/woo_fi_logo.svg"
      >
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof TradingPage>;

export const Default: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    const appState = useAppState();
    return (
      <Page systemState={appState.systemState}>
        <TradingPage symbol={symbol} {...args} />
      </Page>
    );
  },
  // args: {
  //   symbol: "BTC/USDT",
  // },
};

export const CustomizeTheme: Story = {};

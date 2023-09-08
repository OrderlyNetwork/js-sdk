import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { TradeHistory } from ".";
import { OrderlyProvider } from "../../provider/orderlyProvider";
// import { OrderEditFormDialog } from "./dialog/editor";

import { MemoryConfigStore, Web3WalletAdapter } from "@orderly.network/core";
import { WooKeyStore } from "../../stories/mock/woo.keystore";
import { useTradeStream } from "@orderly.network/hooks";

const meta: Meta<typeof TradeHistory> = {
  //   tags: ["autodocs"],
  component: TradeHistory,
  title: "Block/TradeHistory",
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof TradeHistory>;

export const Default: Story = {
  args: {
    dataSource: [
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 5.0,
        executed_timestamp: 1693715298515,
      },
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 5.0,
        executed_timestamp: 1693657394425,
      },
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 2.0,
        executed_timestamp: 1693656074835,
      },
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 2.0,
        executed_timestamp: 1693652176703,
      },
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 3.0,
        executed_timestamp: 1693652103368,
      },
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 4.0,
        executed_timestamp: 1693651100880,
      },
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 3.0,
        executed_timestamp: 1693651011000,
      },
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 3.0,
        executed_timestamp: 1693650913816,
      },
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 5.0,
        executed_timestamp: 1693649993761,
      },
      {
        symbol: "PERP_NEAR_USDC",
        side: "BUY",
        executed_price: 1.2126,
        executed_quantity: 23.1,
        executed_timestamp: 1693625867896,
      },
    ],
  },
};

export const WithHook: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    const { data, isLoading } = useTradeStream(symbol);
    console.log(data);
    return <TradeHistory dataSource={data} loading={isLoading} />;
  },
};

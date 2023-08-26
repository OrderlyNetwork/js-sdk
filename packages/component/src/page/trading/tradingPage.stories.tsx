import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { TradingPage } from ".";
import { OrderlyProvider } from "../../provider";

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
      <OrderlyProvider configStore={undefined}>
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
    return <TradingPage symbol={symbol} {...args} />;
  },
  // args: {
  //   symbol: "BTC/USDT",
  // },
};

export const CustomizeTheme: Story = {};

import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { OrderEntry } from ".";
import { OrderlyProvider } from "../../provider";

import { useOrderEntry } from "@orderly/hooks";

const meta: Meta = {
  title: "Block/OrderEntry",
  component: OrderEntry,
  argTypes: {
    onSubmit: { action: "submit" },
    onDeposit: { action: "deposit" },
  },
  decorators: [
    (Story) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OrderEntry>;

export const Default: Story = {
  args: {
    pair: "BTC/USDT",
    // collateral: 100,
  },
};

export const WithHook: Story = {
  render: () => {
    const { create, validator } = useOrderEntry();
    return (
      <OrderEntry
        pair={"BTC/USDT"}
        available={0}
        onSubmit={(values) => {
          console.log("onSubmit", values);
          create(values);
        }}
      />
    );
  },
};

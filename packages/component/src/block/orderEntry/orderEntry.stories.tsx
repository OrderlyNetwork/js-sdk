import type { Meta, StoryObj } from "@storybook/react";

import { OrderEntry } from ".";

const meta: Meta = {
  title: "Block/OrderEntry",
  component: OrderEntry,
  argTypes: {
    onSubmit: { action: "submit" },
    onDeposit: { action: "deposit" },
  },
};

export default meta;

type Story = StoryObj<typeof OrderEntry>;

export const Default: Story = {
  args: {
    pair: "BTC/USDT",
    // collateral: 100,
  },
};

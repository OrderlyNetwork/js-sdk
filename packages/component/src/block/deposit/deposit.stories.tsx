import type { Meta, StoryObj } from "@storybook/react";
import { Deposit } from ".";
import { usePreLoadData } from "@orderly.network/hooks";

import React from "react";

const meta: Meta<typeof Deposit> = {
  component: Deposit,
  title: "Block/Deposit",
  tags: ["autodocs"],

  argTypes: {
    // onDeposit: { action: "onDeposit" },
    // onConnectWallet: { action: "onConnectWallet" },
  },
};

export default meta;

type Story = StoryObj<typeof Deposit>;

export const Default: Story = {
  args: {},
};

export const NotConnected: Story = {
  args: {},
};

export const WithHooks: Story = {
  render: () => {
    const { error, done } = usePreLoadData();
    console.log({ error, done });
    if (!done) return <div>loading</div>;
    return <Deposit />;
  },
};

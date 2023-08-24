import type { Meta, StoryObj } from "@storybook/react";
import { WalletConnect } from ".";
import React from "react";
import { modal } from "@/modal";
import { OrderlyProvider } from "../../provider/orderlyProvider";

const meta: Meta<typeof WalletConnect> = {
  component: WalletConnect,
  title: "Block/WalletConnect",
  argTypes: {},
  decorators: [
    (Story) => (
      <OrderlyProvider configStore={undefined}>
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof WalletConnect>;

export const Default: Story = {};

export const WithSheet: Story = {
  render: (args) => {
    return (
      <button
        onClick={() => {
          modal.show("walletConnect", args);
        }}
      >
        connect wallet
      </button>
    );
  },
};

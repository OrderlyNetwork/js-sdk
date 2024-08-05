import type { Meta, StoryObj } from "@storybook/react";
import { WalletConnect, showAccountConnectorModal } from ".";
import React from "react";
import { modal } from "@orderly.network/ui";

const meta: Meta<typeof WalletConnect> = {
  component: WalletConnect,
  title: "Block/WalletConnect",
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof WalletConnect>;

export const Default: Story = {};

export const WithSheet: Story = {
  render: (args) => {
    return (
      <button
        onClick={() => {
          showAccountConnectorModal(args).then(
            (result) => {
              console.log(result);
            },
            (err) => {
              console.log(err);
            }
          );
        }}
      >
        connect wallet
      </button>
    );
  },
};

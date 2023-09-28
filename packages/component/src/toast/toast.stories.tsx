import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import toast, { Toaster } from "react-hot-toast";
import { OrderlyProvider } from "../provider";
import { MemoryConfigStore } from "@orderly.network/core";
import { WooKeyStore } from "../stories/mock/woo.keystore";

const meta: Meta<typeof Toaster> = {
  component: Toaster,
  title: "Base/Toast",
  decorators: [
    (Story) => {
      return (
        <OrderlyProvider
          configStore={new MemoryConfigStore()}
          keyStore={new WooKeyStore("testnet")}
        >
          <Story />
        </OrderlyProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => {
    const showSuccess = () => {
      toast.success("Quantity should be less or equal to your max buy.");
    };

    const showError = () => {
      toast.error("Quantity should be less or equal to your max buy.");
    };

    return (
      <div className={"flex gap-3"}>
        <button onClick={showSuccess}>show success</button>
        <button onClick={showError}>show error</button>
      </div>
    );
  },
};

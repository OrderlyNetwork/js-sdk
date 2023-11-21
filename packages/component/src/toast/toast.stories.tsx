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

    const showSubTitle = () => {
      toast.success(
        <div>
          Order opened
          <br />
          <div className="orderly-text-white/[0.54]">Sell ETH-PERP 0.7368</div>
        </div>
      );
    };

    return (
      <div className="orderly-flex orderly-gap-3">
        <button onClick={showSuccess}>show success</button>
        <button onClick={showError}>show error</button>
        <button onClick={showSubTitle}>show subTitle</button>
      </div>
    );
  },
};

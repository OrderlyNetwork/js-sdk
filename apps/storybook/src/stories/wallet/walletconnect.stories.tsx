import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyAppProvider, TradingPage } from "@orderly.network/react";
import { ConnectorProvider } from "@orderly.network/web3-modal";
import { Web3Modal } from "./web3modal";
import {
  OrderlyConfigProvider,
  useWalletConnector,
} from "@orderly.network/hooks";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Page/web3modal",
  component: Web3Modal,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  //   tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
  decorators: [
    (Story) => (
      <ConnectorProvider projectId="cdb3af968143d40d27ad9b0b750dedb0">
        <OrderlyConfigProvider brokerId="orderly" networkId="testnet">
          <Story />
        </OrderlyConfigProvider>
      </ConnectorProvider>
    ),
  ],
};

type Story = StoryObj<typeof Web3Modal>;
// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  render: (args, { globals }) => {
    const { connect } = useWalletConnector();
    return (
      <div>
        <button
          style={{ all: "unset" }}
          onClick={() => {
            connect();
          }}
        >
          connect
        </button>
      </div>
    );
  },
};

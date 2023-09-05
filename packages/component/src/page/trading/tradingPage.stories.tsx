import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { TradingPage } from ".";
import { OrderlyProvider } from "../../provider";
import {
  MemoryConfigStore,
  LocalStorageStore,
  EtherAdapter,
} from "@orderly.network/core";
import { useAppState } from "@orderly.network/hooks";
import { Page } from "../../layout";
import { WooKeyStore } from "../../stories/mock/woo.keystore";
import { OnboardConnectorProvider } from "../../provider/walletConnectorProvider";

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
    (Story) => {
      return (
        <OnboardConnectorProvider>
          <OrderlyProvider
            configStore={new MemoryConfigStore()}
            walletAdapter={EtherAdapter}
            keyStore={new LocalStorageStore("testnet")}
            logoUrl="/woo_fi_logo.svg"
          >
            <Story />
          </OrderlyProvider>
        </OnboardConnectorProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof TradingPage>;

export const Default: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    const appState = useAppState();
    return (
      <Page systemState={appState.systemState}>
        <TradingPage symbol={symbol} {...args} />
      </Page>
    );
  },
  args: {
    tradingViewConfig: {
      scriptSRC: "/tradingview/charting_library/charting_library.js",
      library_path: "/tradingview/charting_library/",
    },
  },
};

export const CustomizeTheme: Story = {};

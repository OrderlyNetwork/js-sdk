import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from '@storybook/test';

import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
// import {CustomConfigStore} from "../CustomConfig Store";
import { TradingPage } from "@orderly.network/trading";
import { Scaffold } from "@orderly.network/ui-scaffold";

const meta = {
  title: "Package/Trading/page",
  component: TradingPage,
  // subcomponents: {
  //     Assets: OverviewModule.AssetWidget,
  //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  // },
  decorators: [
    (Story) => {
      // const networkId = localStorage.getItem("preview-orderly-networkId");
      // const networkId = "mainnet";
      const networkId = "testnet";
      // const networkId = "mainnet";
      // const configStore = new CustomConfigStore({networkId, env: "qa"});
      return (
        <ConnectorProvider>
          <OrderlyApp
            brokerId={"orderly"}
            brokerName={"Orderly"}
            networkId={networkId}
            onChainChanged={fn()}
            // configStore={configStore}
          >
            <Scaffold
              leftSidebar={null}
              // @ts-ignore
              mainNavProps={{
                mainMenus: [
                  { name: "Trading", href: "/" },
                  { name: "Reward", href: "/rewards" },
                  { name: "Markets", href: "/markets" },
                ],
                products: [
                  { name: "Swap", href: "/swap" },
                  { name: "Trade", href: "/trade" },
                ],
                initialMenu: "/markets",
                initialProduct: "/trade",
              }}
            >
              <Story />
            </Scaffold>
          </OrderlyApp>
        </ConnectorProvider>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  args: {
    symbol: "PERP_ETH_USDC",
    tradingViewConfig: {
      scriptSRC: "/tradingview/charting_library/charting_library.js",
      library_path: "/tradingview/charting_library/",
      customCssUrl: "/tradingview/chart.css",
    },
    referral: {
      saveRefCode: true,
      slogan: "Slogan is： NEWBE",
      onClickReferral: () => {
        console.log("click referral");
      },
      onBoundRefCode: (success, error) => {
        console.log("onBoundRefCode", success, error);
      },
      refLink: "https://orderly.netowork/referral?abc=123",
    },
    onSymbolChange:fn(),
  },
} satisfies Meta<typeof TradingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// @ts-ignore
export const Page: Story = {};

// export const LayoutPage: Story = {}

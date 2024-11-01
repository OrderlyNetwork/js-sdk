import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import { OrderlyApp } from "@orderly.network/react-app";
import {
  AssetViewWidget,
  DataListWidget,
  LastTradesWidget,
  RiskRateWidget,
  TradingPageV2,
  OrderBookWidget,
  OrderBookAndTradesWidget
} from "@orderly.network/trading";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { CustomConfigStore } from "../CustomConfigStore";
import { Box, Flex } from "@orderly.network/ui";
import { OrderlyIcon } from "./icons";
import { mainNavProps, sharePnLConfig } from "./config";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";





const meta = {
  title: "Package/Trading/trading-v2",
  component: TradingPageV2,

  decorators: [
    (Story) => {
      // const networkId = localStorage.getItem("preview-orderly-networkId");
      // const networkId = "mainnet";
      const networkId = "testnet";
      // const networkId = "mainnet";
      const configStore = new CustomConfigStore({ networkId, brokerId: "demo", env: "staging" });
      return (
        <WalletConnectorProvider>
          <OrderlyApp
            // brokerId={"orderly"}
            brokerName={"Orderly"}
            networkId={networkId}
            onChainChanged={fn()}
            configStore={configStore}
            appIcons={{
              main: {
                img: "/orderly-logo.svg"
              },
              secondary: {
                img: "/orderly-logo-secondary.svg"
              }
            }}
          >
            <Scaffold
              leftSidebar={null}
              // @ts-ignore
              mainNavProps={mainNavProps}
              classNames={{
                footer: "oui-bg-base-10",
                // content: "oui-min-w-[1440px]",
             }}
            >
              <Story />
            </Scaffold>
          </OrderlyApp>
        </WalletConnectorProvider>
      );
    }
  ],
  parameters: {
    layout: "fullscreen"
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  args: {
    symbol: "PERP_ETH_USDC",
    // symbol: "PERP_ORDER_USDC",
    // symbol: "PERP_1000BONK_USDC",
    // symbol: "PERP_1000PEPE_USDC",
    tradingViewConfig: {
      // scriptSRC: "",
      scriptSRC: "/tradingview/charting_library/charting_library.js",
      library_path: "/tradingview/charting_library/",
      customCssUrl: "/tradingview/chart.css"
    },

    dataList: {
      sharePnLConfig
    },
    referral: {
      onClickReferral: () => {
        console.log("click referral");
      }
    },
    tradingRewards: {
      onClickTradingRewards: () => {
        console.log("click trading rewards");
      }
    },
    onSymbolChange: (symbol) => {
      console.log("will change symbol", symbol);
      
    },
    tabletMediaQuery: "(max-width: 768px)",
    bottomSheetLeading: (<OrderlyIcon size={18} />)
    // bottomSheetLeading: "Orderly"
  }
} satisfies Meta<typeof TradingPageV2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};


export const DataList: Story = {
  render: (arg) => {
    return (<Box p={3} height={800}>
      <DataListWidget sharePnLConfig={sharePnLConfig} tabletMediaQuery={arg.tabletMediaQuery!} />
    </Box>);
  }
};


export const LastTrades: Story = {
  render: (arg) => {

    return (
      <div className="oui-bg-base-10 oui-p-3">
        <Box p={3} r="xl" className="oui-bg-base-9 oui-h-[200px]">
          <LastTradesWidget symbol={arg.symbol} />
        </Box>
      </div>
    );
  }
};


export const AssetView: Story = {
  render: () => {

    return (
      <Box p={3} m={3} r="xl" className="oui-bg-base-9 oui-h-[200px]">
        <AssetViewWidget />
      </Box>
    );
  }
};

export const RiskRate: Story = {
  render: () => {

    return (
      <Box p={3} m={3} r="xl" className="oui-bg-base-9 oui-h-[200px]">
        <RiskRateWidget />
      </Box>
    );
  }
};


export const OrderBook: Story = {
  render: (arg) => {
    return (
      <div className="oui-h-[500px] oui-m-3 oui-flex oui-items-start oui-justify-center">
        <Box className="oui-w-1/2 oui-bg-base-9" r="2xl" py={3}>
          <OrderBookWidget symbol={arg.symbol} tabletMediaQuery={arg.tabletMediaQuery!} />
        </Box>
      </div>
    );
  }
};


export const OrderBookAndTrades: Story = {
  render: (arg) => {
    return (
      <Flex
        p={10}
        justify={"center"}
        itemAlign={"start"}
        className="oui-bg-[rgba(255,255,255,0.3)]"
      >
        <Box className="oui-w-[50vw] oui-h-[600px]">
          <OrderBookAndTradesWidget symbol={arg.symbol} tabletMediaQuery={arg.tabletMediaQuery!} />
        </Box>
      </Flex>
    );
  }
};


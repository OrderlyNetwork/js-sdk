import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AssetViewWidget,
  DataListWidget,
  LastTradesWidget,
  RiskRateWidget,
  TradingPage,
  OrderBookWidget,
  OrderBookAndTradesWidget,
  BottomNavBarWidget,
} from "@orderly.network/trading";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { Box, Flex } from "@orderly.network/ui";
import { OrderlyIcon } from "./icons";
import { mainNavProps, sharePnLConfig } from "./config";

const meta: Meta<typeof TradingPage> = {
  title: "Package/Trading/trading",
  component: TradingPage,

  decorators: [
    (Story) => {
      return (
        <Scaffold mainNavProps={mainNavProps}>
          <Story />
        </Scaffold>
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
      // scriptSRC: "",
      scriptSRC: "/tradingview/charting_library/charting_library.js",
      library_path: "/tradingview/charting_library/",
      customCssUrl: "/tradingview/chart.css",
    },
    sharePnLConfig,
    referral: {
      onClickReferral: () => {
        console.log("click referral");
      },
    },
    tradingRewards: {
      onClickTradingRewards: () => {
        console.log("click trading rewards");
      },
    },
    tabletMediaQuery: "(max-width: 768px)",
    bottomSheetLeading: <OrderlyIcon size={18} />,
    // bottomSheetLeading: "Orderly"
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (arg) => {
    const [symbol, setSymbol] = useState("PERP_BTC_USDC");

    return (
      <TradingPage
        {...arg}
        symbol={symbol}
        onSymbolChange={(symbol) => {
          setSymbol(symbol.symbol);
        }}
      />
    );
  },
};

export const DataList: Story = {
  render: (arg) => {
    return (
      <Box p={3} height={800}>
        <DataListWidget
          sharePnLConfig={sharePnLConfig}
          tabletMediaQuery={arg.tabletMediaQuery!}
        />
      </Box>
    );
  },
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
  },
};

export const AssetView: Story = {
  render: () => {
    return (
      <Box
        p={3}
        m={3}
        r="xl"
        className="oui-bg-base-9 oui-min-h-[200px] oui-w-[400px]"
      >
        <AssetViewWidget />
      </Box>
    );
  },
};

export const RiskRate: Story = {
  render: () => {
    return (
      <Box p={3} m={3} r="xl" className="oui-bg-base-9 oui-h-[200px]">
        <RiskRateWidget />
      </Box>
    );
  },
};

export const OrderBook: Story = {
  render: (arg) => {
    return (
      <div className="oui-h-[500px] oui-m-3 oui-flex oui-items-start oui-justify-center">
        <Box className="oui-w-1/2 oui-bg-base-9" r="2xl" py={3}>
          <OrderBookWidget
            symbol={arg.symbol}
            tabletMediaQuery={arg.tabletMediaQuery!}
          />
        </Box>
      </div>
    );
  },
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
          <OrderBookAndTradesWidget
            symbol={arg.symbol}
            tabletMediaQuery={arg.tabletMediaQuery!}
          />
        </Box>
      </Flex>
    );
  },
};
export const Bottom: Story = {
  render: (arg) => {
    return <BottomNavBarWidget />;
  },
};

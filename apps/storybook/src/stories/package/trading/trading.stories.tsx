import { useEffect, useState } from "react";
import {
  AssetViewWidget,
  BottomNavBarWidget,
  DataListWidget,
  LastTradesWidget,
  OrderBookAndTradesWidget,
  OrderBookWidget,
  RiskRateWidget,
  TradingPage,
} from "@kodiak-finance/orderly-trading";
import { Box, Flex } from "@kodiak-finance/orderly-ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BaseLayout } from "../../../components/layout";
import { tradingPageConfig } from "../../../orderlyConfig";
import { getSymbol, updateSymbol } from "../../../utils/storage";
import { OrderlyIcon } from "./icons";

const meta: Meta<typeof TradingPage> = {
  title: "Package/trading/TradingPage",
  component: TradingPage,
  decorators: [
    (Story) => {
      return (
        <BaseLayout>
          <Story />
        </BaseLayout>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {
    symbol: "PERP_BTC_USDC",
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
    bottomSheetLeading: <OrderlyIcon size={18} />,
    // bottomSheetLeading: "Orderly"
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {
  render: (arg) => {
    const [symbol, setSymbol] = useState(getSymbol() || "PERP_BTC_USDC");

    useEffect(() => {
      updateSymbol(symbol);
    }, [symbol]);

    return (
      <TradingPage
        {...arg}
        tradingViewConfig={tradingPageConfig.tradingViewConfig}
        sharePnLConfig={tradingPageConfig.sharePnLConfig}
        symbol={symbol}
        onSymbolChange={(symbol) => {
          setSymbol(symbol.symbol);
        }}
      />
    );
  },
  args: {
    disableFeatures: [],
  },
};

export const DataList: Story = {
  render: (arg) => {
    return (
      <Box p={3} height={800}>
        <DataListWidget sharePnLConfig={tradingPageConfig.sharePnLConfig} />
      </Box>
    );
  },
};

export const LastTrades: Story = {
  render: (arg) => {
    return (
      <div className="oui-bg-base-10 oui-p-3">
        <LastTradesWidget symbol={arg.symbol} />
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
          <OrderBookWidget symbol={arg.symbol} />
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
          <OrderBookAndTradesWidget symbol={arg.symbol} />
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

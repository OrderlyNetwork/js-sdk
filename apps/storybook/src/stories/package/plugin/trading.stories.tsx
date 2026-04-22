/**
 * Trading stories under plugin-core: showcase plugins in a trading context.
 * All stories run with OrderlyPluginProvider + orderbookStripedFlashPlugin (striped rows + flash on change).
 */
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TradingPage, OrderBookWidget } from "@orderly.network/trading";
import { Box, OrderlyPluginProvider } from "@orderly.network/ui";
import { BaseLayout } from "../../../components/layout";
import { tradingPageConfig } from "../../../orderlyConfig";
import { getSymbol, updateSymbol } from "../../../utils/storage";
import { OrderlyIcon } from "../trading/icons";

// import { registerOrderbookStripedFlashPlugin } from "./orderbookStripedFlashPlugin";

const meta: Meta<typeof OrderBookWidget> = {
  title: "Package/plugin/Trading",
  component: OrderBookWidget,
  decorators: [
    (Story) => (
      <BaseLayout>
        <OrderlyPluginProvider
        // plugins={[registerOrderbookStripedFlashPlugin()]}
        >
          <Story />
        </OrderlyPluginProvider>
      </BaseLayout>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    symbol: "PERP_BTC_USDC",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Orderbook with striped rows and row flash on data change (plugin applied). */
export const OrderBookWithStripedFlash: Story = {
  render: (arg) => (
    <div className="oui-h-[500px] oui-m-3 oui-flex oui-items-start oui-justify-center">
      <Box className="oui-w-1/2 oui-bg-base-9" r="2xl" py={3}>
        <OrderBookWidget symbol={arg.symbol} />
      </Box>
    </div>
  ),
};

/** Full trading page with orderbook striped flash plugin active on the orderbook. */
export const TradingPageWithStripedFlash: Story = {
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
        onSymbolChange={(s) => setSymbol(s.symbol)}
      />
    );
  },
  args: {
    symbol: "PERP_BTC_USDC",
    referral: {
      onClickReferral: () => console.log("click referral"),
    },
    tradingRewards: {
      onClickTradingRewards: () => console.log("click trading rewards"),
    },
    bottomSheetLeading: <OrderlyIcon size={18} />,
    disableFeatures: [],
  },
};

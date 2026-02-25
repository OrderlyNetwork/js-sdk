/**
 * Trading page with split layout provided by plugin (no layoutStrategy/getInitialLayout from host).
 * Demonstrates registerLayoutSplitPlugin() intercepting Trading.Layout.Desktop and rendering split chrome + layout.
 */
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  createTradingSplitLayout,
  registerLayoutSplitPlugin,
} from "@orderly.network/layout-split";
import { TradingPage } from "@orderly.network/trading";
import { OrderlyPluginProvider } from "@orderly.network/ui";
import { BaseLayout } from "../../../components/layout";
import { tradingPageConfig } from "../../../orderlyConfig";
import { getSymbol, updateSymbol } from "../../../utils/storage";
import { OrderlyIcon } from "../trading/icons";

const meta: Meta<typeof TradingPage> = {
  title: "Package/plugin-core/SplitLayoutPlugin",
  component: TradingPage,

  parameters: {
    layout: "fullscreen",
  },
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
    disableFeatures: [],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Split layout provided entirely by plugin; TradingPage does not receive layoutStrategy or getInitialLayout */
export const SplitLayoutViaPlugin: Story = {
  decorators: [
    (Story) => (
      <OrderlyPluginProvider plugins={[registerLayoutSplitPlugin()]}>
        <BaseLayout>
          <Story />
        </BaseLayout>
      </OrderlyPluginProvider>
    ),
  ],
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
};

/** With plugin options: custom getInitialLayout (same split, plugin still injects strategy) */
export const SplitLayoutViaPluginWithOptions: Story = {
  decorators: [
    (Story) => (
      <OrderlyPluginProvider
        plugins={[
          registerLayoutSplitPlugin({
            getInitialLayout: (opts) =>
              createTradingSplitLayout({
                variant: opts?.variant,
                layoutSide: opts?.layoutSide,
                mainSplitSize: opts?.mainSplitSize,
                orderBookSplitSize: opts?.orderBookSplitSize,
                dataListSplitSize: opts?.dataListSplitSize,
              }),
          }),
        ]}
      >
        <BaseLayout>
          <Story />
        </BaseLayout>
      </OrderlyPluginProvider>
    ),
  ],
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
};

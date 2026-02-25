/**
 * Trading page with grid layout provided by plugin (no layoutStrategy/getInitialLayout from host).
 * Demonstrates registerLayoutGridPlugin() intercepting Trading.DesktopLayout and rendering grid layout.
 */
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  createTradingGridLayout,
  registerLayoutGridPlugin,
} from "@orderly.network/layout-grid";
import { TradingPage } from "@orderly.network/trading";
import { OrderlyPluginProvider } from "@orderly.network/ui";
import { BaseLayout } from "../../../components/layout";
import { tradingPageConfig } from "../../../orderlyConfig";
import { getSymbol, updateSymbol } from "../../../utils/storage";
import { OrderlyIcon } from "../trading/icons";

const meta: Meta<typeof TradingPage> = {
  title: "Package/plugin-core/GridLayoutPlugin",
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

/** Grid layout provided entirely by plugin; TradingPage does not receive layoutStrategy or getInitialLayout */
export const GridLayoutViaPlugin: Story = {
  decorators: [
    (Story) => (
      <OrderlyPluginProvider plugins={[registerLayoutGridPlugin()]}>
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

/** With plugin options: custom getInitialLayout (same grid, plugin still injects strategy) */
export const GridLayoutViaPluginWithOptions: Story = {
  decorators: [
    (Story) => (
      <OrderlyPluginProvider
        plugins={[
          registerLayoutGridPlugin({
            getInitialLayout: () => createTradingGridLayout(),
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

/**
 * Trading page with split layout.
 * Uses registerLayoutSplitPlugin so the full split chrome (markets, DnD, Flex) is applied.
 */
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { registerLayoutSplitPlugin } from "@orderly.network/layout-split";
import { TradingPage } from "@orderly.network/trading-next";
import { OrderlyPluginProvider } from "@orderly.network/ui";
import { BaseLayout } from "../../../components/layout";
import { tradingPageConfig } from "../../../orderlyConfig";
import { getSymbol, updateSymbol } from "../../../utils/storage";
import { OrderlyIcon } from "./icons";

const meta: Meta<typeof TradingPage> = {
  title: "Package/trading/Split Layout",
  component: TradingPage,
  decorators: [
    (Story) => (
      <OrderlyPluginProvider plugins={[registerLayoutSplitPlugin()]}>
        <BaseLayout>
          <Story />
        </BaseLayout>
      </OrderlyPluginProvider>
    ),
  ],
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

export const SplitLayoutPage: Story = {
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

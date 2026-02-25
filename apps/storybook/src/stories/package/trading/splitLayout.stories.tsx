/**
 * Trading page with split layout strategy.
 * Layout strategy and initial layout factory are passed from outside (layout-split package).
 */
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  createTradingSplitLayout,
  splitStrategy,
} from "@orderly.network/layout-split";
import { TradingPage } from "@orderly.network/trading";
import { BaseLayout } from "../../../components/layout";
import { tradingPageConfig } from "../../../orderlyConfig";
import { getSymbol, updateSymbol } from "../../../utils/storage";
import { OrderlyIcon } from "./icons";

const meta: Meta<typeof TradingPage> = {
  title: "Package/trading/Split Layout",
  component: TradingPage,
  decorators: [
    (Story) => (
      <BaseLayout>
        <Story />
      </BaseLayout>
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
        layoutStrategy={splitStrategy}
        getInitialLayout={(opts) =>
          createTradingSplitLayout({
            variant: opts.variant,
            layoutSide: opts.layoutSide,
            mainSplitSize: opts.mainSplitSize,
            orderBookSplitSize: opts.orderBookSplitSize,
            dataListSplitSize: opts.dataListSplitSize,
          })
        }
      />
    );
  },
};

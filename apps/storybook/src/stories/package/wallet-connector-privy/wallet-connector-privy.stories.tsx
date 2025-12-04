import { useState } from "react";
import { StoryObj } from "@storybook/react-vite";
import { TradingPage } from "@veltodefi/trading";
import { Scaffold } from "@veltodefi/ui-scaffold";
import { useRouteContext } from "../../../components/orderlyProvider/rounteProvider";
import { tradingPageConfig, useMainNav } from "../../../orderlyConfig";
import { OrderlyIcon } from "../trading/icons";

const meta = {
  title: "Package/wallet-connector-privy",
  component: TradingPage,
  decorators: [
    (Story: any) => {
      const mainNavProps = useMainNav();
      const { onRouteChange } = useRouteContext();
      return (
        <Scaffold mainNavProps={mainNavProps} routerAdapter={{ onRouteChange }}>
          <Story />
        </Scaffold>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    walletConnectorType: "privy",
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

export const Default: Story = {
  render: (arg) => {
    const [symbol, setSymbol] = useState("PERP_BTC_USDC");
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
};

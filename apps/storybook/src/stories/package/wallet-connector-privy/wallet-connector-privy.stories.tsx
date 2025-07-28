import { useState } from "react";
import { StoryObj } from "@storybook/react-vite";
import { TradingPage } from "@orderly.network/trading";
import { MainNavWidget } from "@orderly.network/ui-scaffold";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { useNav } from "../../../hooks/useNav";
import { useOrderlyConfig } from "../../../hooks/useOrderlyConfig";
import { OrderlyIcon } from "../trading/icons.tsx";

const meta = {
  title: "Package/wallet-connector-privy",
  component: TradingPage,
  decorators: [
    (Story: any) => {
      const config = useOrderlyConfig();
      const { onRouteChange } = useNav();
      return (
        <Scaffold
          mainNavProps={config.scaffold.mainNavProps}
          routerAdapter={{ onRouteChange }}
        >
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
    const config = useOrderlyConfig();
    return (
      <TradingPage
        {...arg}
        tradingViewConfig={config.tradingPage.tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
        symbol={symbol}
        onSymbolChange={(symbol) => {
          setSymbol(symbol.symbol);
        }}
      />
    );
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyApp } from "@orderly.network/react-app";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { CustomConfigStore } from "../CustomConfigStore.ts";
import { Box } from "@orderly.network/ui";
import { Scaffold } from "@orderly.network/ui-scaffold";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "dev", brokerName: "Orderly", brokerId: "orderly" });


const meta = {
  title: "Package/ui-tradingview",
  component: TradingviewWidget,
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyApp brokerId="orderly" brokerName="Orderly" networkId={networkId}
                    configStore={configStore} appIcons={{
          main: {
            img: "/orderly-logo.svg"
          },
          secondary: {
            img: "/orderly-logo-secondary.svg"
          }
        }}>
          <Scaffold>

            <Box height={600}>

              <Story />
            </Box>
          </Scaffold>
        </OrderlyApp>
      </WalletConnectorProvider>
    )
  ],
  parameters: {},

  args: {

    symbol: "PERP_BTC_USDC"
  }

} satisfies Meta<typeof TradingviewWidget>;

type Story = StoryObj<typeof meta>;

export default meta;

const tradingviewProps = {
  symbol: "PERP_ETH_USDC",
  scriptSRC: "/tradingview/charting_library/charting_library.js",
  libraryPath: "/tradingview/charting_library/",
  customCssUrl: "/tradingview/chart.css"
};

export const Default: Story = {
  args: {
    ...tradingviewProps
  }
};


export const NoTradingviewFile: Story = {

  render: () => {
    return <TradingviewWidget
      symbol="PERP_BTC_USDC" />;
  }
};

const tradingviewProps2 = {
  symbol: "PERP_ETH_USDC",
  scriptSRC: "/tradingviewWoofiPro/charting_library/charting_library.js",
  libraryPath: "/tradingviewWoofiPro/charting_library/",
  customCssUrl: "/tradingviewWoofiPro/chart.css"
};

export const SellBuyOnTradingview: Story = {
  render: () => {
    return <TradingviewWidget
      {...tradingviewProps2}

    />;
  }

};

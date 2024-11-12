import type { Meta, StoryObj } from "@storybook/react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { Box } from "@orderly.network/ui";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { CustomConfigStore } from "../../../components/configStore/customConfigStore";

const configStore = new CustomConfigStore({
  networkId: "testnet",
  env: "staging",
  brokerName: "Orderly",
  brokerId: "orderly",
});


const meta = {
  title: "Package/ui-tradingview",
  component: TradingviewWidget,
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          configStore={configStore}
          appIcons={{
            main: {
              img: "/orderly-logo.svg",
            },
            secondary: {
              img: "/orderly-logo-secondary.svg",
            },
          }}
        >
          <Scaffold>

            <Box height={600}>

              <Story />
            </Box>
          </Scaffold>
        </OrderlyAppProvider>
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

import type { Meta, StoryObj } from "@storybook/react";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyApp } from "@orderly.network/react-app";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { CustomConfigStore } from "../CustomConfigStore.ts";
import { Box } from "@orderly.network/ui";
import { AccountMenuWidget } from "@orderly.network/ui-scaffold";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging", brokerName: "Orderly", brokerId: "orderly" });


const meta = {
  title: "Package/ui-tradingview/buySellOnTradingview",
  component: TradingviewWidget,
  decorators: [
    (Story) => (
      <ConnectorProvider>
        <OrderlyApp brokerId="orderly" brokerName="Orderly" networkId={networkId}
                    configStore={configStore} appIcons={{
          main: {
            img: "/orderly-logo.svg"
          },
          secondary: {
            img: "/orderly-logo-secondary.svg"
          }
        }}>
         <AccountMenuWidget/>
          <Box height={600}>

            <Story />
          </Box>
        </OrderlyApp>
      </ConnectorProvider>
    )
  ],
  parameters: {

  },

  args: {

    symbol: 'PERP_BTC_USDC',
  },

} satisfies Meta<typeof TradingviewWidget>;

type Story = StoryObj<typeof meta>;

export default meta;

const tradingviewProps2= {
  symbol: "PERP_ETH_USDC",
  scriptSRC: "/tradingviewWoofiPro/charting_library/charting_library.js",
  libraryPath: "/tradingviewWoofiPro/charting_library/",
  customCssUrl: "/tradingviewWoofiPro/chart.css",
}

export const Default: Story = {
  args: {
    ...tradingviewProps2,
  }
};



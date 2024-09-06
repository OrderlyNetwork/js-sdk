import type { Meta, StoryObj } from "@storybook/react";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyApp } from "@orderly.network/react-app";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { CustomConfigStore } from "../CustomConfigStore.ts";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging", brokerName: "Orderly", brokerId: "orderly" });


const meta = {
  title: "Package/ui-tradingview",
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
          <Story />
        </OrderlyApp>
      </ConnectorProvider>
    )
  ],
  parameters: {

  },

  args: {

  }
} satisfies Meta<typeof TradingviewWidget>;

type Story = StoryObj<typeof meta>;

export default meta;

const tradingviewProps = {
  symbol: "PERP_ETH_USDC",
  tradingViewScriptSrc: "/tradingview/charting_library/charting_library.js",
  libraryPath: "/tradingview/charting_library/",
  tradingViewCustomCssUrl: "/tradingview/chart.css",
}

export const Default: Story = {
  render: () => {
    return <TradingviewWidget
      {...tradingviewProps}
    />;
  }
};

export const NoTradingviewFile: Story = {
  render: () => {
    return <TradingviewWidget/>
  }
}
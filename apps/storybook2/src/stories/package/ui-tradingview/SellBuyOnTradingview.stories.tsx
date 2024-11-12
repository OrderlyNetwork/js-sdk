import type { Meta, StoryObj } from "@storybook/react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { CustomConfigStore } from "../../../components/configStore/customConfigStore.ts";
import { Box } from "@orderly.network/ui";
import { AccountMenuWidget } from "@orderly.network/ui-scaffold";

const networkId = "testnet";
const configStore = new CustomConfigStore({
  networkId,
  env: "staging",
  brokerName: "Orderly",
  brokerId: "orderly",
});

const meta: Meta<typeof TradingviewWidget> = {
  title: "Package/ui-tradingview/buySellOnTradingview",
  component: TradingviewWidget,
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          networkId={networkId}
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
          <AccountMenuWidget />
          <Box height={600}>
            <Story />
          </Box>
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
  parameters: {},

  args: {
    symbol: "PERP_BTC_USDC",
  },
};

type Story = StoryObj<typeof meta>;

export default meta;

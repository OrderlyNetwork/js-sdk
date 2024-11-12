import type { Meta, StoryObj } from "@storybook/react";
import { PositionsModule } from "@orderly.network/portfolio";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { sharePnLConfig } from "../trading/config";
import { useTradingLocalStorage } from "@orderly.network/trading";
import { Box } from "@orderly.network/ui";

const meta: Meta<typeof PositionsModule.PositionsPage> = {
  title: "Package/Portfolio/Positions",
  component: PositionsModule.PositionsPage,
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
        >
          <Box className="oui-h-[calc(100vh)]" p={6}>
            <Story />
          </Box>
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {
  render: () => {
    const local = useTradingLocalStorage();

    return (
      <PositionsModule.PositionsPage
        sharePnLConfig={sharePnLConfig}
        pnlNotionalDecimalPrecision={local.pnlNotionalDecimalPrecision}
        calcMode={local.unPnlPriceBasis}
        onSymbolChange={(symbol) => {
          console.log("symbol changed", symbol);
        }}
      />
    );
  },
};

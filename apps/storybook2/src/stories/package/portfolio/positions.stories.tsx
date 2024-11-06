import type { Meta, StoryObj } from "@storybook/react";
import { PositionsModule, } from "@orderly.network/portfolio";
import { OrderlyApp } from "@orderly.network/react-app";
// import {Box} from "@orderly.network/ui";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { mainNavProps, sharePnLConfig } from "../trading/config";
import { useTradingLocalStorage } from "@orderly.network/trading";
import { Flex, Text, Divider, Box } from "@orderly.network/ui";


const meta = {
  title: "Package/Portfolio/Positions",
  component: PositionsModule.PositionsPage,
  subcomponents: {

  },
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
          <Box className="oui-h-[calc(100vh)]" p={6}><Story /></Box>
        </OrderlyApp>
      </WalletConnectorProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    // p: {
    //   control: {
    //     type: "number",
    //     min: 0,
    //     max: 10,
    //     step: 1,
    //   },
    // },
  },
  args: {
    // p: 5,
  },
} satisfies Meta<typeof PositionsModule.PositionsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {
  render: (child) => {

    const local = useTradingLocalStorage();

    return <PositionsModule.PositionsPage 
      sharePnLConfig={sharePnLConfig}
      pnlNotionalDecimalPrecision={local.pnlNotionalDecimalPrecision}
      calcMode={local.unPnlPriceBasis}
      onSymbolChange={(symbol) => {
        console.log("symbol changed", symbol);
        
      }}
    />;
  }
};
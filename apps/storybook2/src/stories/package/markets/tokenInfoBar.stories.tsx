import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import {
  TokenInfoBarFullWidget,
} from "@orderly.network/markets";
import { Box, Button, Flex } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });

const meta = {
  title: "Package/Markets/TokenInfoBar",
  component: TokenInfoBarFullWidget,
  decorators: [
    (Story: any) => (
      <ConnectorProvider>
        <OrderlyApp
          brokerId={"orderly"}
          brokerName={""}
          networkId={"testnet"}
          configStore={configStore}
        >
          <Story />
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
} satisfies Meta<typeof TokenInfoBarFullWidget>;

export default meta;
type Story = StoryObj<typeof meta>;


export const TokenInfoBar: Story = {
  render: (args) => {
    return <Flex direction='column' itemAlign='start' gapY={5}>
      <Box width={600} intensity={900} r="2xl" px={3}>
        <TokenInfoBarFullWidget
          height={54}
          symbol="PERP_BTC_USDC"
          trailing={<Box pl={3}>Trailing</Box>}          
          onSymbolChange={(symbol) => {
            console.log('onSymbolChange', symbol);
          }}
        />
      </Box>
      <Box width={900} intensity={900} r="2xl" px={3}>
        <TokenInfoBarFullWidget
          height={54}
          symbol="PERP_BTC_USDC"
          trailing={<Box pl={3}>Trailing</Box>}          
          onSymbolChange={(symbol) => {
            console.log('onSymbolChange', symbol);
          }}
        />
      </Box>
      <Box width='100%' intensity={900} r="2xl" px={3}>
        <TokenInfoBarFullWidget
          height={54}
          symbol="PERP_BTC_USDC"
          trailing={<Box pl={3}>Trailing</Box>}          
          onSymbolChange={(symbol) => {
            console.log('onSymbolChange', symbol);
          }}
        />
      </Box>
    </Flex>
  },
};
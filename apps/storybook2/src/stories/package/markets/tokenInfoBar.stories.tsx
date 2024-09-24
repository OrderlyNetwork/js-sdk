import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import {
  TokenInfoBarWidget,
} from "@orderly.network/markets";
import { Box, Button, Flex } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";
import { useState } from "react";

const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });

const meta = {
  title: "Package/Markets/TokenInfoBar",
  component: TokenInfoBarWidget,
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
} satisfies Meta<typeof TokenInfoBarWidget>;

export default meta;
type Story = StoryObj<typeof meta>;


export const TokenInfoBar: Story = {
  render: (args) => {
    const [layout, setLayout] = useState<'left' | 'right'>('right');
    return <Flex direction='column' itemAlign='start' gapY={5}>
      <Box width={600}>
        <TokenInfoBarWidget symbol="PERP_BTC_USDC" layout={layout} onLayout={setLayout} />
      </Box>
      <Box width={900}>
        <TokenInfoBarWidget symbol="PERP_BTC_USDC" layout={layout} onLayout={setLayout} />
      </Box>
      <Box width='100%'>
        <TokenInfoBarWidget symbol="PERP_BTC_USDC" layout={layout} onLayout={setLayout} />
      </Box>
    </Flex>
  },
};
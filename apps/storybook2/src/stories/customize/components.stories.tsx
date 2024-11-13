import type { StoryObj } from "@storybook/react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { Box, Flex, Text, SettingIcon } from "@orderly.network/ui";
import {
  AccountMenuWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
  Scaffold,
} from "@orderly.network/ui-scaffold";
import { fn } from "@storybook/test";

import { WalletConnectorProvider } from "@orderly.network/wallet-connector";

const meta = {
  title: "Customize/Scaffold",
  component: Scaffold,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
          onChainChanged={fn()}
        >
          <Story />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Flex m={3} justify={"center"} height={"400px"} intensity={500} r={"lg"}>
        <Text size={"3xl"} intensity={54}>
          Content
        </Text>
      </Flex>
    ),
  },
};

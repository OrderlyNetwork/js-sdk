import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "@orderly.network/ui";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyApp } from "@orderly.network/react-app";
import { AccountMenuWidget } from "@orderly.network/ui-scaffold";
import { CustomConfigStore } from "../CustomConfigStore.ts";
const networkId = "testnet";

const configStore = new CustomConfigStore({ networkId, env: "dev", brokerName: 'WOOFiPRO', brokerId: 'woofi_pro' });

const meta = {

  title: "Package/solana/connect",
  component: AccountMenuWidget,
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyApp
          brokerId={"woofi_pro"}
          brokerName={"WOOFiPRO"}
          networkId={"testnet"}
          configStore={configStore}
        >
          <Story />
        </OrderlyApp>
      </WalletConnectorProvider>
    ),
  ],
} satisfies Meta;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  decorators: [
    (Story) => (
      <Box width={"360px"} p={5} intensity={800} r={"lg"}>
        {Story()}
      </Box>
    ),
  ],
};

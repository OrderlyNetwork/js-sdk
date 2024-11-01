import type { Meta, StoryObj } from "@storybook/react";
import { FeeTierModule, OrdersModule } from "@orderly.network/portfolio";
import { OrderlyApp } from "@orderly.network/react-app";
// import {Box} from "@orderly.network/ui";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { Divider, Flex, Text } from "@orderly.network/ui";
// import { } from '@orderly.network/ui-orders';

const meta = {
  title: "Package/Portfolio/Orders",
  component: OrdersModule.OrdersPage,
  subcomponents: {

  },
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
          <Story />
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
} satisfies Meta<typeof FeeTierModule.FeeTierPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

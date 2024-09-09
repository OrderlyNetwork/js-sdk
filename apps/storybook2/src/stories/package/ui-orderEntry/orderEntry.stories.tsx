import type { Meta, StoryObj } from "@storybook/react";
import { OrderEntryWidget, OrderEntry } from "@orderly.network/ui-order-entry";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box } from "@orderly.network/ui";
import { OrderSide, OrderType } from "@orderly.network/types";

const meta = {
  title: "Package/ui-orderEntry",
  component: OrderEntry,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <ConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
          <Box width={"360px"} r={"lg"} intensity={700} p={3}>
            <Story />
          </Box>
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
  argTypes: {
    side: {
      control: {
        type: "inline-radio",
      },
      options: [OrderSide.BUY, OrderSide.SELL],
    },
  },
  args: {
    symbol: "PERP_ETH_USDC",
    side: OrderSide.BUY,
    type: OrderType.LIMIT,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const PureComponent = {
  args: {
    orderEntity: {
      side: OrderSide.BUY,
      type: OrderType.LIMIT,
    },
  },
};

export const WithHook: Story = {
  render: (args) => {
    return <OrderEntryWidget {...args} />;
  },
};

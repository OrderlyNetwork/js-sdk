import type { Meta, StoryObj } from "@storybook/react";
import {
  OrderEntryWidget,
  OrderEntry,
  AdditionalInfoWidget,
} from "@orderly.network/ui-order-entry";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { Box } from "@orderly.network/ui";
import { OrderSide, OrderType } from "@orderly.network/types";

const meta = {
  title: "Package/ui-orderEntry/form",
  component: OrderEntry,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
        >
          <Box width={"360px"} r={"lg"} intensity={900} p={3}>
            <Story />
          </Box>
        </OrderlyAppProvider>
      </WalletConnectorProvider>
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

import type { Meta, StoryObj } from "@storybook/react";
import {
  OrderEntryWidget,
  OrderEntry,
  OrderConfirmDialog,
} from "@orderly.network/ui-order-entry";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { Box } from "@orderly.network/ui";
import { OrderSide, OrderType } from "@orderly.network/types";

const meta = {
  title: "Package/ui-orderEntry/dialog",
  component: OrderConfirmDialog,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Box width={"360px"} r={"lg"} intensity={700} p={5}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {},
  args: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const PureComponent = {
  args: {
    symbol: "PERP_ETH_USDC",
    quote: "USDC",
    base: "ETH",
    side: OrderSide.BUY,
    type: OrderType.LIMIT,
    qty: 0.0001,
    price: 2567.256,
    total: 0.2567256,
    quoteDP: 2,
    baseDP: 4,
    tpPrice: 1100,
    slPrice: 900,
    onConfirm: async () => {},
    onCancel: () => {},
  },
};

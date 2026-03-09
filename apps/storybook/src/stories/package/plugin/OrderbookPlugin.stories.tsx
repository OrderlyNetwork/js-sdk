/**
 * Stories for the orderbook plugin: striped rows + flash on data change.
 * Demonstrates intercepting OrderBook.Desktop.Asks and OrderBook.Desktop.Bids.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrderBookWidget } from "@orderly.network/trading";
import { Box, OrderlyPluginProvider } from "@orderly.network/ui";
import { registerOrderbookStripedFlashPlugin } from "./orderbookStripedFlashPlugin";

const meta: Meta<typeof OrderBookWidget> = {
  title: "Package/plugin-core/OrderbookPlugin",
  component: OrderBookWidget,
  decorators: [
    (Story) => (
      <OrderlyPluginProvider plugins={[registerOrderbookStripedFlashPlugin()]}>
        <Story />
      </OrderlyPluginProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  args: {
    symbol: "PERP_BTC_USDC",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Orderbook with striped rows and row flash on data change (live or mock). */
export const OrderBookWithPlugin: Story = {
  render: (arg) => (
    <div className="oui-h-[500px] oui-w-[580px] oui-m-3 oui-flex oui-items-start oui-justify-center">
      <Box className="oui-w-1/2 oui-bg-base-9" r="2xl" py={3}>
        <OrderBookWidget symbol={arg.symbol} />
      </Box>
    </div>
  ),
};

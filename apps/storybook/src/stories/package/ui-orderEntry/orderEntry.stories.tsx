import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrderSide, OrderType } from "@veltodefi/types";
import { Box } from "@veltodefi/ui";
import { OrderEntryWidget, OrderEntry } from "@veltodefi/ui-order-entry";

const meta: Meta<typeof OrderEntry> = {
  title: "Package/ui-order-entry/form",
  component: OrderEntry,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Box width={"360px"} r={"lg"} intensity={900} p={3}>
        <Story />
      </Box>
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

export const WithHook: Story = {
  render: (args) => {
    return <OrderEntryWidget {...args} />;
  },
};

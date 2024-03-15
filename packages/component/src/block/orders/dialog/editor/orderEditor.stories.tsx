import type { Meta, StoryObj } from "@storybook/react";
import { OrderEditForm } from "./editorForm";

const meta: Meta<typeof OrderEditForm> = {
  component: OrderEditForm,
  title: "Block/Orders/WalletPicker",
  argTypes: {
    // onChange: { action: "onChange" },
  },
};

export default meta;

type Story = StoryObj<typeof OrderEditForm>;

export const Default: Story = {
  args: {
    symbol: "PERP_ETH_USDC",
    order: {
      order_id: 450516587,
      symbol: "PERP_ETH_USDC",
      side: "SELL",
      quantity: 0.5007,
      type: "MARKET",
      status: "FILLED",
      // "total_executed_quantity": 0.5007,
      // visible_quantity: 0.5007,
      average_executed_price: 3969.37,
      total_fee: 1.192479,
      fee_asset: "USDC",
      reduce_only: true,
      created_time: 1710391460869,
      updated_time: 1710391460875,
    },
  },
};

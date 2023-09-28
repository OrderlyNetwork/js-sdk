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
    // symbol: "BTC-PERP",
    // order: {},
  },
};

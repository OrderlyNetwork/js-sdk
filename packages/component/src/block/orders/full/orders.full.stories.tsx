import type { Meta, StoryObj } from "@storybook/react";
import { OrdersViewFull } from ".";

const meta: Meta<typeof OrdersViewFull> = {
  component: OrdersViewFull,
  title: "Block/Orders/web",
};

export default meta;
type Story = StoryObj<typeof OrdersViewFull>;

export const Default: Story = {
  args: {
    dataSource: [],
  },
};

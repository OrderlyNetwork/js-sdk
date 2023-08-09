import type { Meta, StoryObj } from "@storybook/react";

import { OrdersView } from ".";

const meta: Meta<typeof OrdersView> = {
  //   tags: ["autodocs"],
  component: OrdersView,
  title: "Block/OrdersView",
};

export default meta;

type Story = StoryObj<typeof OrdersView>;

export const Default: Story = {};

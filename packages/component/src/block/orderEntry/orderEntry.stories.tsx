import type { Meta, StoryObj } from "@storybook/react";

import { OrderEntry } from ".";

const meta: Meta = {
  title: "Block/OrderEntry",
  component: OrderEntry,
};

export default meta;

type Story = StoryObj<typeof OrderEntry>;

// storybook action

export const Default: Story = {
  // render: () => <OrderEntry />,
  argTypes: {
    onSubmit: { action: "submit" },
  },
};

import type { Meta } from "@storybook/react";

import { OrderBook } from ".";
import { StoryObj } from "@storybook/react";
import { Divider } from "../../divider";

const meta: Meta = {
  title: "Block/OrderBook",
  component: OrderBook,
};

export default meta;
type Story = StoryObj<typeof OrderBook>;

export const Default: Story = {
  render: () => {
    return (
      <OrderBook
        asks={[]}
        bids={[]}
        markPrice={""}
        lastPrice={""}
        depth={[0.0001, 0.001, 0.01, 0.1]}
      />
    );
  },
};

import type { Meta } from "@storybook/react";

import { OrderBook } from ".";

const meta: Meta = {
  title: "Block/OrderBook",
  component: OrderBook,
};

export default meta;

export const Default = () => (
  <OrderBook asks={[]} bids={[]} markPrice={""} lastPrice={""} />
);

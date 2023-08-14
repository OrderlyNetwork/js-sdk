import type { Meta } from "@storybook/react";
import React from "react";
import { OrderBook } from ".";
import { StoryObj } from "@storybook/react";
import { useOrderbook, useInfo } from "@orderly/hooks";
import { OrderlyProvider } from "../../provider/orderlyProvider";

const meta: Meta = {
  title: "Block/OrderBook",
  component: OrderBook,
  decorators: [
    (Story) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
  argTypes: {
    onItemClick: { action: "itemClick" },
  },
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

export const WithData: Story = {
  render: (args) => {
    const [data, { onDepthChange }] = useOrderbook("PERP_ETH_USDC");
    const { data: info } = useInfo("PERP_ETH_USDC");
    // console.log(data);
    console.log(info);
    return (
      <OrderBook
        {...args}
        asks={data.asks}
        bids={data.bids}
        depth={[]}
        lastPrice={""}
        markPrice={""}
      />
    );
  },
};

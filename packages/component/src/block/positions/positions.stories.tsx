import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { usePositionStream } from "@orderly/hooks";
import { PositionsView } from ".";
import { OrderlyProvider } from "../../provider/orderlyProvider";

const meta: Meta = {
  title: "Block/PositionsView",
  component: PositionsView,
  argTypes: {
    onLimitClose: { action: "onLimitClose" },
    onMarketClose: { action: "onMarketClose" },
    loadMore: { action: "loadMore" },
    onMarketCloseAll: { action: "onMarketCloseAll" },
  },
  args: {
    // dataSource: [],
  },
  decorators: [
    (Story) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof PositionsView>;

export const Default: Story = {
  args: {
    dataSource: [1, 2, 3, 4],
  },
};

export const WithData: Story = {
  render: (args) => {
    const [data, { loading }] = usePositionStream();
    console.log(data);
    return <PositionsView {...args} dataSource={data} />;
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { usePositionStream } from "@orderly.network/hooks";
import { HistoryListView } from ".";
import { OrderlyProvider } from "../../provider/orderlyProvider";

const meta: Meta = {
  title: "Block/HistoryListView",
  component: HistoryListView,
  parameters: {
    layout: "fullscreen",
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

type Story = StoryObj<typeof HistoryListView>;

export const Default: Story = {
  args: {
    dataSource: [1, 2, 3],
  },
};

export const WithHooks: Story = {
  render: (args) => {
    // const [data, { loading }] = usePositionStream();
    // console.log(data);
    return <HistoryListView {...args} />;
  },
};

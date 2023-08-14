import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { usePositionStream } from "@orderly/hooks";
import { HistoryListView } from ".";
import { OrderlyProvider } from "../../provider/orderlyProvider";

const meta: Meta = {
  title: "Block/HistoryListView",
  component: HistoryListView,

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

// export const WithData: Story = {
//   render: (args) => {
//     const [data, { loading }] = usePositionStream();
//     console.log(data);
//     return <HistoryListView {...args} dataSource={data} />;
//   },
// };

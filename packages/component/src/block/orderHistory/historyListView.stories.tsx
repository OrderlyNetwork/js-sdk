import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { useOrderStream } from "@orderly.network/hooks";
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
    const [data, { isLoading }] = useOrderStream({ status: "" });

    console.log(data);
    return <HistoryListView dataSource={data} isLoading={isLoading} />;
  },
};

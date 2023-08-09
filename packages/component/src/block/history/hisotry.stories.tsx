import type { Meta, StoryObj } from "@storybook/react";

import { TradeHistoryView } from ".";
import React from "react";

const meta: Meta<typeof TradeHistoryView> = {
  //   tags: ["autodocs"],
  component: TradeHistoryView,
  title: "Block/TradeHistoryView",
};

export default meta;

type Story = StoryObj<typeof TradeHistoryView>;

export const Default: Story = {
  render: (args) => <TradeHistoryView {...args} />,
  args: {
    dataSource: [1, 2, 3],
  },
};

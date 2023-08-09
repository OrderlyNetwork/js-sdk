import type { Meta, StoryObj } from "@storybook/react";

import { PositionsView } from ".";

const meta: Meta = {
  title: "Block/PositionsView",
  component: PositionsView,
  argTypes: {
    onLimitClose: { action: "onLimitClose" },
    onMarketClose: { action: "onMarketClose" },
    loadMore: { action: "loadMore" },
    onMarketCloseAll: { action: "onMarketCloseAll" },
  },
};

export default meta;

type Story = StoryObj<typeof PositionsView>;

export const Default: Story = {
  args: {
    dataSource: [1, 2, 3, 4],
  },
};

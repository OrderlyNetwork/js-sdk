import type { Meta, StoryObj } from "@storybook/react";

import { Statistic } from ".";

const meta: Meta = {
  title: "Base/Statistic",
  component: Statistic,
  //   parameters: {
  //     layout: "fullscreen",
  //   },
};

export default meta;

type Story = StoryObj<typeof Statistic>;

export const Default: Story = {
  args: {
    label: "Unreal. PnL",
    value: "123456",
    coloring: true,
  },
  // description: "Description",
};

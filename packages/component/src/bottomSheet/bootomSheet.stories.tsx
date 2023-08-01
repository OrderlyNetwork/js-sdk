import type { Meta, StoryObj } from "@storybook/react";

import { BottomSheet } from ".";

const meta: Meta<typeof BottomSheet> = {
  title: "Base/BottomSheet",
  component: BottomSheet,
};

export default meta;

type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
  args: {
    title: "Bottom Sheet",
    children: "Bottom Sheet Content",
  },
};

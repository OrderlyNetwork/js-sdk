import type { Meta, StoryObj } from "@storybook/react";

import { Avatar } from ".";

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  title: "Base/Avatar",
  argTypes: {
    // onCheckedChange: { action: "checkedChange" },
  },
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

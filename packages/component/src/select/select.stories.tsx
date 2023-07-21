import type { Meta, StoryObj } from "@storybook/react";

import { Select } from ".";

const meta: Meta<typeof Select> = {
  component: Select,
  title: "Base/Select",
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    size: "default",
    label: "Select",
  },
};

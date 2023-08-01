import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from ".";

const meta: Meta<typeof Divider> = {
  component: Divider,
  title: "Base/Divider",
};

export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {};

export const Text: Story = {
  args: {
    children: "Hello World",
  },
};

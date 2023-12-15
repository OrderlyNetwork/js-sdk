import type { Meta, StoryObj } from "@storybook/react";

import { AccountInfo } from ".";

const meta: Meta<typeof AccountInfo> = {
  component: AccountInfo,
  title: "Block/AccountInfo",
};

export default meta;
type Story = StoryObj<typeof AccountInfo>;

export const Default: Story = {};

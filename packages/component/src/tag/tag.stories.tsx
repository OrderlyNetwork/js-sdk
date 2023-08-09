import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Tag } from ".";

const meta: Meta<typeof Tag> = {
  //   tags: ["autodocs"],
  component: Tag,
  title: "Base/Tag",
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  render: (args) => <Tag {...args}>Buy</Tag>,
};

import type { Meta, StoryObj } from "@storybook/react";

import { Slider } from ".";

const meta: Meta<typeof Slider> = {
  tags: ["autodocs"],
  component: Slider,
  title: "Base/Slider",
};

export default meta;

type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => <Slider />,
};

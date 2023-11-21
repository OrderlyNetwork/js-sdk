import type { Meta, StoryObj } from "@storybook/react";
import { Withdraw } from ".";

const meta: Meta<typeof Withdraw> = {
  component: Withdraw,
  title: "Block/Withdraw",
  argTypes: {
    // @ts-ignore
    onChange: { action: "onChange" },
  },
};

export default meta;

type Story = StoryObj<typeof Withdraw>;

export const Default: Story = {};

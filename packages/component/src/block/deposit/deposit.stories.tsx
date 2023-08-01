import type { Meta, StoryObj } from "@storybook/react";
import { Deposit } from ".";

const meta: Meta<typeof Deposit> = {
  component: Deposit,
  title: "Block/Deposit",
  argTypes: {
    onChange: { action: "onChange" },
  },
};

export default meta;

type Story = StoryObj<typeof Deposit>;

export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/react";
import { QuantityInput } from ".";

const meta: Meta<typeof QuantityInput> = {
  component: QuantityInput,
  title: "Block/QuantityInput",
  argTypes: {
    onChange: { action: "onChange" },
  },
};

export default meta;

type Story = StoryObj<typeof QuantityInput>;

export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/react";
import { TokenPicker } from "./tokenPicker";

const meta: Meta<typeof TokenPicker> = {
  component: TokenPicker,
  title: "Block/TokenPicker",
  argTypes: {
    onChange: { action: "onChange" },
  },
};

export default meta;

type Story = StoryObj<typeof TokenPicker>;

export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/react";
import { WalletPicker } from "./index";

const meta: Meta<typeof WalletPicker> = {
  component: WalletPicker,
  title: "Block/WalletPicker",
  argTypes: {
    // onChange: { action: "onChange" },
  },
};

export default meta;

type Story = StoryObj<typeof WalletPicker>;

export const Default: Story = {};

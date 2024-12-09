import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { Input } from "@orderly.network/ui";

const meta = {
  title: "Base/Input/Extend",
  component: Input.token,
  //   subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  // tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "inline-radio" },
    },
  },
  args: {
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TokenQuantity: Story = {
  args: {
    tokens: ["BTC", "ETH"],
    placeholder: "Quantity",
  },
};

export const OnlyOneToken: Story = {
  args: {
    tokens: ["BTC"],
  },
};

export const AlignRight: Story = {
  args: {
    tokens: ["BTC", "ETH"],
    align: "right",
    prefix: "Quantity",
  },
};

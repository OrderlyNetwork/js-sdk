import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Slippage } from "./slippage";

import { SlippageDialog } from "./slippageDialog";

const meta: Meta<typeof Slippage> = {
  component: Slippage,
  title: "Block/Swap/Slippage",
  argTypes: {
    onConfirm: { action: "onConfirm" },
  },
  args: { value: 0.5 },
};

export default meta;

type Story = StoryObj<typeof Slippage>;

export const Default: Story = {};

export const Dialog: Story = {
  render: (args) => {
    return (
      <SlippageDialog {...args}>
        <button>Open swap dialog</button>
      </SlippageDialog>
    );
  },
};

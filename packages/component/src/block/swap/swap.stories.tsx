import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Swap } from ".";
import { SwapDialog } from "./swapDialog";
import { modal } from "@/modal";

const meta: Meta<typeof Swap> = {
  component: Swap,
  title: "Block/Swap",
  argTypes: {
    // onChange: { action: "onChange" },
  },
  args: {
    src: {
      chain: 42161,
      token: "BNB",
    },
    dst: {
      chain: 56,
      token: "USDC",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Swap>;

export const Default: Story = {};

export const Dialog: Story = {
  render: (args) => {
    return (
      <div>
        <button
          onClick={() => {
            modal.show(SwapDialog, args);
          }}
        >
          Open swap dialog
        </button>
      </div>
    );
  },
};

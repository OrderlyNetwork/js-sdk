import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DepositAndWithdraw } from ".";
import { modal } from "@orderly.network/ui";
import { DepositAndWithdrawWithSheet } from "./depositAndwithdraw";
// import { modalActions } from "@/modal/modalContext";

const meta: Meta<typeof DepositAndWithdraw> = {
  component: DepositAndWithdraw,
  title: "Block/DepositAndWithdraw",
  argTypes: {
    // onChange: { action: "onChange" },
  },
};

export default meta;

type Story = StoryObj<typeof DepositAndWithdraw>;

export const Default: Story = {};

export const withSheet: Story = {
  render: () => {
    return (
      <div className="orderly-flex orderly-gap-3">
        <button
          onClick={() => {
            modal.show(DepositAndWithdrawWithSheet, { activeTab: "deposit" });
          }}
        >
          Deposit
        </button>
        <button
          onClick={() => {
            modal.show(DepositAndWithdrawWithSheet, { activeTab: "withdraw" });
          }}
        >
          Withdraw
        </button>
      </div>
    );
  },
};

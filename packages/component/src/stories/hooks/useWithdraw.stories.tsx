import React, { FC } from "react";

import { Meta, StoryObj } from "@storybook/react";
import { useAccount, useWithdraw } from "@orderly.network/hooks";

const WithdrawDemo: FC<{
  maxAmount: string;
  availableBalance: string;
  [key: string]: any;
}> = (props) => {
  return (
    <div className="text-black">
      <div>
        <span>Max:</span>
        <span>{props.maxAmount}</span>
      </div>
      <div>
        <span>Available Balance:</span>
        <span>{props.availableBalance}</span>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/useWithdraw",
  component: WithdrawDemo,
};

type Story = StoryObj<typeof WithdrawDemo>;

export default meta;

export const Default: Story = {
  render: () => {
    const state = useWithdraw();
    return <WithdrawDemo {...state} />;
  },
};

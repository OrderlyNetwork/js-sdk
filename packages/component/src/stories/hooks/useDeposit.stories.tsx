import React, { FC } from "react";

import { Meta, StoryObj } from "@storybook/react";
import { useAccount, useDeposit } from "@orderly.network/hooks";

const DepositDemo: FC<{
  balance: string;
  allowance: string;
}> = (props) => {
  return (
    <div className="orderly-text-black">
      <div>
        <span>Wallet balance:</span>
        <span>{props.balance}</span>
      </div>
      <div>
        <span>Allowance:</span>
        <span>{props.allowance}</span>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/useDeposit",
  component: DepositDemo,
};

type Story = StoryObj<typeof DepositDemo>;

export default meta;

export const Default: Story = {
  render: () => {
    const state = useDeposit();
    return <DepositDemo {...state} />;
  },
};

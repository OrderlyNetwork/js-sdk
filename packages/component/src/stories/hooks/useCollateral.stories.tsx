import React, { FC } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { useCollateral } from "@orderly.network/hooks";

const CollateralDemo: FC<{
  totalCollateral: number;
  freeCollateral: number;
  totalValue: number;
}> = (props) => {
  return (
    <div className="orderly-text-black">
      <div className="orderly-flex orderly-gap-5">
        <span>Total Collateral:</span>
        <span>{props.totalCollateral}</span>
      </div>
      <div className="orderly-flex orderly-gap-5">
        <span>Free Collateral:</span>
        <span>{props.freeCollateral}</span>
      </div>
      <div className="orderly-flex orderly-gap-5">
        <span>Total Value:</span>
        <span>{props.totalValue}</span>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/useCollateral",
  component: CollateralDemo,
};

export default meta;

type Story = StoryObj<typeof CollateralDemo>;

export const Default: Story = {
  render: () => {
    const collateral = useCollateral();
    return (
      <CollateralDemo
        totalCollateral={collateral.totalCollateral}
        freeCollateral={collateral.freeCollateral}
        totalValue={collateral.totalValue}
      />
    );
  },
};

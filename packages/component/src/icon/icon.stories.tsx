import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Coin } from ".";

const meta: Meta<typeof Coin> = {
  component: Coin,
  title: "Base/Coin",
};

export default meta;

type Story = StoryObj<typeof Coin>;

export const Default: Story = {
  args: {
    name: "WOO",
    size: "small",
  },
};

export const Coins: Story = {
  render: () => {
    return (
      <div className="flex gap-3">
        <Coin name="WOO" size="medium" />
        <Coin name="BTC" size="medium" />
        <Coin name="ETH" size="medium" />
        <Coin name="NEAR" size="medium" />
      </div>
    );
  },
};

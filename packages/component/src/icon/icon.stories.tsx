import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NetworkImage } from ".";

const meta: Meta<typeof NetworkImage> = {
  component: NetworkImage,
  title: "Base/Image",
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof NetworkImage>;

export const Default: Story = {
  args: {
    name: "WOO",
    type: "coin",
  },
};

export const Coins: Story = {
  render: () => {
    return (
      <div className={"flex flex-col gap-3"}>
        <div className="flex gap-3">
          <NetworkImage name="WOO" type={"coin"} size={"small"} />
          <NetworkImage name="BTC" type={"coin"} size={"small"} />
          <NetworkImage name="ETH" type={"coin"} size={"small"} />
          <NetworkImage name="NEAR" type={"coin"} size={"small"} />
        </div>
        <div className="flex gap-3">
          <NetworkImage name="WOO" type={"coin"} />
          <NetworkImage name="BTC" type={"coin"} />
          <NetworkImage name="ETH" type={"coin"} />
          <NetworkImage name="NEAR" type={"coin"} />
        </div>
        <div className="flex gap-3">
          <NetworkImage name="WOO" type={"coin"} size={"large"} />
          <NetworkImage name="BTC" type={"coin"} size={"large"} />
          <NetworkImage name="ETH" type={"coin"} size={"large"} />
          <NetworkImage name="NEAR" type={"coin"} size={"large"} />
        </div>
      </div>
    );
  },
};

export const Chains: Story = {
  render: () => {
    return (
      <div className={"flex flex-col gap-3"}>
        <div className="flex gap-3">
          <NetworkImage id={1} type={"chain"} size={"small"} />
          <NetworkImage id={56} type={"chain"} size={"small"} />
          <NetworkImage id={42161} type={"chain"} size={"small"} />
          <NetworkImage id={10} type={"chain"} size={"small"} />
          <NetworkImage id={250} type={"chain"} size={"small"} />
        </div>
        <div className="flex gap-3">
          <NetworkImage id={1} type={"chain"} />
          <NetworkImage id={56} type={"chain"} />
          <NetworkImage id={42161} type={"chain"} />
          <NetworkImage id={10} type={"chain"} />
          <NetworkImage id={250} type={"chain"} />
        </div>
        <div className="flex gap-3">
          <NetworkImage id={1} type={"chain"} size={"large"} />
          <NetworkImage id={56} type={"chain"} size={"large"} />
          <NetworkImage id={42161} type={"chain"} size={"large"} />
          <NetworkImage id={10} type={"chain"} size={"large"} />
          <NetworkImage id={250} type={"chain"} size={"large"} />
        </div>
      </div>
    );
  },
};

export const CustomSize: Story = {
  render: () => {
    return (
      <div className={"flex gap-5"}>
        <div className={"flex flex-col items-center"}>
          <NetworkImage id={56} type={"chain"} size={64} />
          <div>size: 64px</div>
        </div>
        <div className={"flex flex-col items-center"}>
          <NetworkImage id={56} type={"chain"} size={128} />
          <div>size: 128px</div>
        </div>
      </div>
    );
  },
};

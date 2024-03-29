import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NetworkImage } from ".";

const meta: Meta<typeof NetworkImage> = {
  component: NetworkImage,
  title: "Base/Image/Simple",
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof NetworkImage>;

export const Default: Story = {
  args: {
    name: "NetworkImage",
    type: "token",
  },
};

export const Coins: Story = {
  render: () => {
    return (
      <div className="orderly-flex orderly-flex-col orderly-gap-3">
        <div className="orderly-flex orderly-gap-3">
          <NetworkImage name="BTC" type={"token"} size={"small"} />
          <NetworkImage name="ETH" type={"token"} size={"small"} />
          <NetworkImage name="NEAR" type={"token"} size={"small"} />
        </div>
        <div className="orderly-flex orderly-gap-3">
          <NetworkImage name="BTC" type={"token"} />
          <NetworkImage name="ETH" type={"token"} />
          <NetworkImage name="NEAR" type={"token"} />
        </div>
        <div className="orderly-flex orderly-gap-3">
          <NetworkImage name="BTC" type={"token"} size={"large"} />
          <NetworkImage name="ETH" type={"token"} size={"large"} />
          <NetworkImage name="NEAR" type={"token"} size={"large"} />
        </div>
      </div>
    );
  },
};

export const Chains: Story = {
  render: () => {
    return (
      <div className="orderly-flex orderly-flex-col orderly-gap-3">
        <div className="orderly-flex orderly-gap-3">
          <NetworkImage id={1} type={"chain"} size={"small"} />
          <NetworkImage id={56} type={"chain"} size={"small"} />
          <NetworkImage id={42161} type={"chain"} size={"small"} />
          <NetworkImage id={10} type={"chain"} size={"small"} />
          <NetworkImage id={250} type={"chain"} size={"small"} />
        </div>
        <div className="orderly-flex orderly-gap-3">
          <NetworkImage id={1} type={"chain"} />
          <NetworkImage id={56} type={"chain"} />
          <NetworkImage id={42161} type={"chain"} />
          <NetworkImage id={10} type={"chain"} />
          <NetworkImage id={250} type={"chain"} />
        </div>
        <div className="orderly-flex orderly-gap-3">
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
      <div className="orderly-flex orderly-gap-5">
        <div className="orderly-flex orderly-flex-col orderly-items-center">
          <NetworkImage id={56} type={"chain"} size={64} />
          <div>size: 64px</div>
        </div>
        <div className="orderly-flex orderly-flex-col orderly-items-center">
          <NetworkImage id={56} type={"chain"} size={128} />
          <div>size: 128px</div>
        </div>
      </div>
    );
  },
};

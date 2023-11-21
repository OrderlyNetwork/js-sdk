import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { OrderlyProvider } from "../provider";
import { Text } from ".";
import { OrderStatus } from "@orderly.network/types";

const meta: Meta<typeof Text> = {
  component: Text,
  title: "Base/Text",
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: "Normal Text",
  },
};

export const TextRules: Story = {
  render: (args) => {
    return (
      <div className={"flex flex-col gap-3"}>
        <div className="flex gap-3">
          <span className="text-green-400">Normal:</span>{" "}
          <Text {...args}>Normal Text</Text>
        </div>
        <hr />
        <div className="flex gap-3">
          <span className="text-green-400">Date:</span>{" "}
          <Text {...args} rule={"date"}>
            Thu Aug 17 2023 14:33:38 GMT+0800 (China Standard Time)
          </Text>
        </div>

        <hr />
        <div className="flex gap-3">
          <span className="text-green-400">Address:</span>
          <Text {...args} rule={"address"}>
            0xd659f3DeCe290110421A71B438b4F5A375F8bE58
          </Text>
        </div>

        <hr />
        <div className="flex gap-3">
          <span className="text-green-400">Symbol:</span>
          <Text {...args} rule="symbol">
            PERP_ETH_USDC
          </Text>
        </div>

        <hr />
        <div className="flex gap-3">
          <span className="text-green-400">Order Status:</span>
          <Text {...args} rule="status">
            {OrderStatus.NEW}
          </Text>
        </div>
      </div>
    );
  },
};

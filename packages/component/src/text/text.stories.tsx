import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { OrderlyProvider } from "../provider";
import { Text } from ".";

const meta: Meta<typeof Text> = {
  component: Text,
  title: "Base/Text",
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: "Normal Text",
  },
};

export const TextStyles: Story = {
  render: (args) => {
    return (
      <div className={"flex flex-col gap-3"}>
        <Text {...args}>Normal Text</Text>
        <Text {...args} rule={"date"}>
          Thu Aug 17 2023 14:33:38 GMT+0800 (China Standard Time)
        </Text>
        <Text {...args} rule={"address"}>
          0xd659f3DeCe290110421A71B438b4F5A375F8bE58
        </Text>
      </div>
    );
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { OrderlyProvider } from "../provider";
import { ListTile } from ".";
import { Statistic } from "../statistic";

const meta: Meta<typeof ListTile> = {
  component: ListTile,
  title: "Base/ListTile",
};

export default meta;

type Story = StoryObj<typeof ListTile>;

export const Default: Story = {
  args: {
    title: "BTC-PERP",
    subtitle: "226.621M",
    avatar: {
      type: "coin",
      name: "BTC",
    },
    tailing: (
      <Statistic
        label={"1,947.54"}
        value={0.012}
        rule={"percentages"}
        align={"right"}
        coloring
        valueClassName={"text-3xs"}
      />
    ),
  },
};

export const WithSymbol: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    return <ListTile.symbol {...args} symbol={symbol} />;
  },
};

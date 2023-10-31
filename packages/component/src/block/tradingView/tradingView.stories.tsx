import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TradingView } from ".";

const meta: Meta<typeof TradingView> = {
  component: TradingView,
  title: "Block/TradingView",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof TradingView>;

export const Default: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;

    return (
      <div style={{ width: "100%", height: "300px" }}>
        <TradingView {...args} symbol={symbol} />
      </div>
    );
  },
  args: {
    // autosize: true,
    width: "100%",
    height: 320,
    apiBaseUrl: "",
    // intervals: ["1", "3", "5", "15", "30", "60", "240", "720", "1D", "1W"],
  },
};

import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyProvider, TradingPage } from "@orderly.network/components";
import { MemoryConfigStore } from "@orderly.network/core";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Page/TradingPage",
  component: TradingPage,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  //   tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
  decorators: [
    (Story) => (
      <OrderlyProvider configStore={new MemoryConfigStore()}>
        <Story />
      </OrderlyProvider>
    ),
  ],
};

type Story = StoryObj<typeof TradingPage>;
// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    return <TradingPage symbol={symbol} {...args} />;
  },
  args: {
    tradingViewConfig: {
      scriptSRC:
        "https://dev-dex-iap-v2.woo.org/assets/woo-chart/charting_library/charting_library.js",
    },
  },
};

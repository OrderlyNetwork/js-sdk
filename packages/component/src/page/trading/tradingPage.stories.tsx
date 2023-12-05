import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { TradingPage } from ".";

import { Page } from "../../layout";
const meta: Meta = {
  title: "Page/Trading",
  component: TradingPage,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    symbol: {
      // control: 'text'
      control: "select",
      options: ["BTC/USDT", "ETH/USDT"],
    },
  },
  // decorators: [
  //   (Story) => (
  //     <SWRDevTools>
  //       <Story />
  //     </SWRDevTools>
  //   ),
  // ],
};

export default meta;

type Story = StoryObj<typeof TradingPage>;

export const Default: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    return <TradingPage {...args} symbol={symbol} />;
  },
  args: {
    tradingViewConfig: {
      scriptSRC: "/tradingview/charting_library/charting_library.js",
      library_path: "/tradingview/charting_library/",
    },
  },
};

export const CustomizeTheme: Story = {};

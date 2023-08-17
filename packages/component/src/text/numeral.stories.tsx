import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { OrderlyProvider } from "../provider";
import { Numeral } from "./numeral";
// import { ConfigDataProvider } from "@orderly/hooks";

const meta: Meta<typeof Numeral> = {
  component: Numeral,
  title: "Base/Numeral",
  tags: ["autodocs"],
  decorators: [
    (Story) => {
      return (
        <OrderlyProvider>
          <Story />
        </OrderlyProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Numeral>;

export const Default: Story = {
  args: {
    children: 2323.0,
  },
};

export const Percentage: Story = {
  args: {
    children: 0.34,
    rule: "percentages",
  },
};

export const WithConfig = () => {
  return <Numeral.symbol symbol="PERP_ETH_USDC">232.323422</Numeral.symbol>;
};

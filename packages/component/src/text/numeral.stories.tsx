import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { OrderlyProvider } from "../provider";
import { Numeral } from ".";
import { NumeralTotal } from "./numeralTotal";
// import { ConfigDataProvider } from "@orderly.network/hooks";

const meta: Meta<typeof Numeral> = {
  component: Numeral,
  title: "Base/Numeral",
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Numeral>;

export const Default: Story = {
  args: {
    children: 2323.023,
    rule: "price",
  },
};

export const Percentage: Story = {
  args: {
    children: 0.34,
    rule: "percentages",
  },
};

export const Total: Story = {
  render: () => {
    return <NumeralTotal price={1680.0} quantity={1.2} />;
  },
};

export const SurfixAndPrefix: Story = {
  render: () => {
    return (
      <div>
        <Numeral
          prefix={<span className="orderly-text-base-contrast/50">-</span>}
          surfix={<span className="orderly-text-base-contrast/50">ETH</span>}
        >
          123123
        </Numeral>
      </div>
    );
  },
};

export const WithConfig: Story = {
  render: (args, { globals }) => {
    return <Numeral.symbol symbol={globals.symbol}>232.323422</Numeral.symbol>;
  },
  args: {
    // symbol: globals.symbol,
  },
};

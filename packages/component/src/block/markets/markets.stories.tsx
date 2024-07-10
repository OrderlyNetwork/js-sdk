import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { Markets } from ".";
import { OrderlyProvider } from "../../provider";

import { useSymbolsInfo, useMarketsStream } from "@orderly.network/hooks";
import { Sheet, SheetContent, SheetTrigger } from "../../sheet";
import Button from "../../button";

// import {SheetStorie} from "../../sheet/sheet.stories";

const meta: Meta = {
  title: "Block/Markets/Mweb",
  component: Markets,
  argTypes: {
    onItemClick: { action: "onItemClick" },
  },
};

export default meta;

type Story = StoryObj<typeof Markets>;

export const Default: Story = {
  args: {
    dataSource: [
      {
        symbol: "PERP_ETH_USDC",
        index_price: 1828.35,
        mark_price: 1828.5,
        sum_unitary_funding: 92.45,
        est_funding_rate: 0.0001,
        last_funding_rate: 0.00009852,
        next_funding_time: 1692172800000,
        open_interest: "null",
        "24h_open": 1811.0,
        "24h_close": 1811.0,
        "24h_high": 1811.0,
        "24h_low": 1811.0,
        "24h_volume": 1.1,
        "24h_amount": 1992.1,
      },
      {
        symbol: "PERP_NEAR_USDC",
        index_price: 1.2853,
        mark_price: 1.2926,
        sum_unitary_funding: 0.20935,
        est_funding_rate: 0.0075,
        last_funding_rate: 0.00749883,
        next_funding_time: 1692172800000,
        open_interest: "null",
        "24h_open": 1.3574,
        "24h_close": 1.3574,
        "24h_high": 1.3574,
        "24h_low": 1.3574,
        "24h_volume": 253.7,
        "24h_amount": 344.3724,
      },
    ],
  },
};

export const WithHooks: Story = {
  render: () => {
    const { data } = useMarketsStream();
    // useSymbolsInfo();
    //
    return <Markets dataSource={data} />;
  },
};

export const WithSheet: Story = {
  render: (args) => {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <button type={"button"}>ETH/USDC</button>
        </SheetTrigger>
        <SheetContent side={"left"}>
          <Markets {...args} />
        </SheetContent>
      </Sheet>
    );
  },
  args: {
    dataSource: [],
  },
};

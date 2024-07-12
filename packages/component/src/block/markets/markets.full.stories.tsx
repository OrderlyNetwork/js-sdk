import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { MarketsFull } from "./markets.full";

import { useSymbolsInfo, useMarketsStream } from "@orderly.network/hooks";
import { Sheet, SheetContent, SheetTrigger } from "../../sheet";
import Button from "../../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../dropdown/dropdown";

// import {SheetStorie} from "../../sheet/sheet.stories";

const meta: Meta = {
  title: "Block/Markets/Desktop",
  component: MarketsFull,
  argTypes: {
    onItemClick: { action: "onItemClick" },
  },
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof MarketsFull>;

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

    return <MarketsFull dataSource={data} maxHeight={300} />;
  },
};

export const WithDropdown: Story = {
  render: (args) => {
    const { data } = useMarketsStream();
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type={"button"}>ETH/USDC</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={"start"}
          className={"orderly-w-[580px] orderly-py-5 orderly-bg-base-600"}
        >
          <MarketsFull dataSource={data} />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
  args: {
    dataSource: [],
  },
};

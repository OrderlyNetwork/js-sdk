import type { Meta, StoryObj } from "@storybook/react";

import { SimpleMarketOverview } from ".";
import * as React from "react";
// import { useMarketInfo, useTickerStream, useFundingRate } from "@orderly.network/hooks";
import { OrderlyProvider } from "../../provider";
import { useMemo } from "react";
import { useSymbolsInfo, useTickerStream } from "@orderly.network/hooks";

const meta: Meta = {
  title: "Block/MarketOverview",
  component: SimpleMarketOverview,
  //   parameters: {
  //     layout: "fullscreen",
  //   },

  args: {
    // items: {
    //   price: {
    //     lastPrice: "123456",
    //     percentChange: "12.34%",
    //   },
    //   fundingRate: {
    //     fundingRate: "",
    //     timout: 123,
    //   },
    // },
  },
};

export default meta;

type Story = StoryObj<typeof SimpleMarketOverview>;

export const Default: Story = {
  // description: "Description",
};

export const WithHooks: Story = {
  render: (args, { globals }) => {
    const symbol = globals.symbol;
    const data = useTickerStream(symbol);
    const symbolInfo = useSymbolsInfo()[symbol];

    // const symbolsInfo
    return (
      <SimpleMarketOverview
        change={data?.change ?? 0}
        price={data?.["24h_close"] ?? 0}
        symbolInfo={symbolInfo}
      />
    );
  },
};

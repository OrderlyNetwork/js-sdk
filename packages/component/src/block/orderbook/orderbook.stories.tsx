import type { Meta } from "@storybook/react";
// @ts-ignore
import React from "react";
import { OrderBook } from ".";
import { StoryObj } from "@storybook/react";
import { useOrderbookStream, useSymbolsInfo } from "@orderly.network/hooks";
import { OrderlyProvider } from "../../provider/orderlyProvider";
import { MemoryConfigStore } from "@orderly.network/core";
import { WooKeyStore } from "../../stories/mock/woo.keystore";
import { SymbolProvider } from "../../provider";

const meta: Meta = {
  title: "Block/OrderBook",
  component: OrderBook,

  argTypes: {
    onItemClick: { action: "itemClick" },
  },
};

export default meta;
type Story = StoryObj<typeof OrderBook>;

export const Default: Story = {
  render: (args) => {
    return (
      <OrderBook
        {...args}
        markPrice={1}
        lastPrice={[1]}
        depth={[0.0001, 0.001, 0.01, 0.1]}
      />
    );
  },
  args: {
    autoSize: true,
    asks: [
      [1849.66, 0.4523, 237.20850000000002],
      [1844.91, 44.9007, 236.7562],
      [1844.86, 24.5644, 191.8555],
      [1843.25, 34.8963, 167.2911],
      [1843.19, 85.803, 132.3948],
      [1842.55, 2.7415, 46.5918],
      [1842.32, 23.5324, 43.8503],
      [1841.93, 2.5189, 20.317899999999998],
      [1841.82, 6.3684, 17.799],
      [1841.72, 3.1256, 11.4306],
      [1841.7, 3.1669, 8.305],
      [1841.63, 5.1381, 5.1381],
    ],
    bids: [
      [1841.62, 2.7381, 2.7381],
      [1841.35, 3.1765, 5.9146],
      [1841.32, 6.3645, 12.2791],
      [1841.3, 5.1644, 17.4435],
      [1840.99, 3.2013, 20.6448],
      [1840.81, 2.5183, 23.1631],
      [1840.49, 22.6799, 45.843],
      [1839.79, 34.9193, 80.76230000000001],
      [1839.52, 82.3603, 163.1226],
      [1839.35, 24.5644, 187.687],
      [1838.07, 44.8905, 232.57750000000001],
      [1832.9, 54.8288, 287.4063],
    ],
  },
};

export const WithData: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    const [data, { onDepthChange }] = useOrderbookStream(symbol);
    const symbolInfo = useSymbolsInfo()[symbol];

    return (
      <SymbolProvider symbol={symbol}>
        <OrderBook
          {...args}
          asks={data.asks}
          bids={data.bids}
          depth={[]}
          base={symbolInfo("base")}
          quote={symbolInfo("quote")}
          lastPrice={data.middlePrice}
          markPrice={data.markPrice}
        />
      </SymbolProvider>
    );
  },
};

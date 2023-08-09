import type { Meta, StoryObj } from "@storybook/react";

import { MarketOverview } from ".";
import React from "react";
import { useMarketInfo, useQuery } from "@orderly/hooks";
import { OrderlyProvider } from "../../provider/orderlyProvider";

const meta: Meta = {
  title: "Block/MarketOverview",
  component: MarketOverview,
  //   parameters: {
  //     layout: "fullscreen",
  //   },
  decorators: [
    (Story) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
  args: {
    items: {
      price: {
        lastPrice: "123456",
        percentChange: "12.34%",
      },
      fundingRate: {
        fundingRate: "",
        timout: 123,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof MarketOverview>;

export const Default: Story = {
  // description: "Description",
};

export const WithData: Story = {
  render: (args) => {
    const data = useMarketInfo("PERP_ETH_USDC");
    useQuery("/public/token");
    return <MarketOverview {...args} />;
  },
};

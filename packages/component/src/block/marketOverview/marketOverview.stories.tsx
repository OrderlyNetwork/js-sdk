import type { Meta, StoryObj } from "@storybook/react";

import { SimpleMarketOverview } from ".";
import * as React from "react";
import { useMarketInfo, useTickerStream, useFundingRate } from "@orderly/hooks";
import { OrderlyProvider } from "../../provider";
import { useMemo } from "react";

const meta: Meta = {
  title: "Block/MarketOverview",
  component: SimpleMarketOverview,
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

// export const WithData: Story = {
//   render: (args) => {
//     const { data: info } = useMarketInfo("PERP_ETH_USDC");
//     const { data: tickerData } = useTickerStream("PERP_ETH_USDC");
//     const { data: fundingRate } = useFundingRate("PERP_ETH_USDC");
//
//     // console.log(fundingRate);
//
//     const price = useMemo(() => {
//       if (!tickerData)
//         return {
//           lastPrice: Number.NaN,
//           percentChange: "0.00%",
//         };
//
//       return {
//         lastPrice: tickerData.close,
//         percentChange:
//           (
//             ((tickerData.close - tickerData.open) / tickerData.open) *
//             100
//           ).toFixed(2) + "%",
//       };
//     }, [tickerData]);
//
//     return (
//       <MarketOverview
//         items={{
//           price,
//           fundingRate: {
//             fundingRate: fundingRate.est_funding_rate.toFixed(4),
//             timout: fundingRate.next_funding_time,
//           },
//         }}
//       />
//     );
//   },
// };

import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { usePositionStream } from "@orderly.network/hooks";
import { PositionsView } from ".";
import { modal } from "@orderly.network/ui";
import { ClosePositionPane } from "./sections/closeForm";

const meta: Meta = {
  title: "Block/Positions/mweb",
  component: PositionsView,
  argTypes: {
    onLimitClose: { action: "onLimitClose" },
    onMarketClose: { action: "onMarketClose" },
    loadMore: { action: "loadMore" },
    onMarketCloseAll: { action: "onMarketCloseAll" },
  },
  parameters: {
    layout: "fullscreen",
  },
  args: {
    // dataSource: [],
  },
};

export default meta;

type Story = StoryObj<typeof PositionsView>;

export const Default: Story = {
  args: {
    aggregated: {},
    dataSource: [
      {
        symbol: "PERP_ETH_USDC",
        position_qty: 0.01,
        cost_position: 18.58986,
        last_sum_unitary_funding: 0.0,
        pending_long_qty: 0.0,
        pending_short_qty: 0.0,
        settle_price: 1858.986,
        average_open_price: 1857.5,
        unsettled_pnl: -2.81596,
        mark_price: 1672.6,
        est_liq_price: 0.0,
        timestamp: 1691644867041,
        mmr: 0.0275,
        imr: 0.2,
        IMR_withdraw_orders: 0.2,
        MMR_with_orders: 0.0275,
        pnl_24_h: 0.0,
        notional: 18.57,
        fee_24_h: 0.0,
      },
      {
        symbol: "PERP_NEAR_USDC",
        position_qty: 5.0,
        cost_position: 6.79243,
        last_sum_unitary_funding: 0.17939,
        pending_long_qty: 0.0,
        pending_short_qty: 0.0,
        settle_price: 1.358486,
        average_open_price: 1.3574,
        unsettled_pnl: -1.57318,
        mark_price: 1.2197,
        est_liq_price: 0.0,
        timestamp: 1692063942690,
        mmr: 0.05,
        imr: 0.2,
        notional: 6.79,
        IMR_withdraw_orders: 0.2,
        MMR_with_orders: 0.05,
        pnl_24_h: 0.0,
        fee_24_h: 0.0,
      },
    ],
    onLimitClose: async (position) => {
      const result = await modal.sheet({
        title: "Limit Close",
        content: <ClosePositionPane position={position} />,
      });
    },
  },
};

export const WithHooks: Story = {
  render: (args, { globals }) => {
    const [symbol, setSymbol] = React.useState(globals.symbol);
    const [data, info, { loading }] = usePositionStream(symbol);

    const onShowAllSymbolChange = (isAll: boolean) => {
      setSymbol(isAll ? "" : globals.symbol);
    };

    return (
      <PositionsView
        {...args}
        dataSource={data.rows}
        aggregated={data.aggregated}
        showAllSymbol={symbol === ""}
        isLoading={loading}
        onShowAllSymbolChange={onShowAllSymbolChange}
      />
    );
  },
};

import React from "react";
import { ClosePositionPane } from "./sections/closeForm";
import { OrderSide } from "@orderly.network/types";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Block/ClosePositionPane",
  component: ClosePositionPane,
  argTypes: {},

  args: {
    position: {
      symbol: "PERP_ETH_USDC",
      position_qty: 0.151,
      cost_position: 18.58986,
      last_sum_unitary_funding: 0.0,
      pending_long_qty: 0.0,
      pending_short_qty: 0.0,
      settle_price: 1858.986,
      average_open_price: 1857.5,
      unsettled_pnl: -2.82296,
      mark_price: 1671.9,
      est_liq_price: 0.0,
      timestamp: 1691644867041,
      mmr: 0.0275,
      imr: 0.2,
      IMR_withdraw_orders: 0.2,
      MMR_with_orders: 0.0275,
      pnl_24_h: 0.0,
      fee_24_h: 0.0,
    },
    side: OrderSide.SELL,
  },
};

export default meta;

type Story = StoryObj<typeof ClosePositionPane>;

export const Default: Story = {};

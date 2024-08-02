import type { Meta, StoryObj } from "@storybook/react";
import { SharePnLIcon } from "./sharePnLIcon";
import { modal } from "@orderly.network/ui";
import { SharePoisitionView } from "./sharePosition";
import React from "react";

const meta: Meta = {
  title: "Block/share/pnl",
  component: SharePoisitionView,
  args: {
    position: {
      symbol: "PERP_AVAX_USDC",
      position_qty: -10,
      cost_position: -394.119,
      last_sum_unitary_funding: 0.2236,
      pending_long_qty: 0,
      pending_short_qty: 0,
      settle_price: 39.4119,
      average_open_price: 39.81,
      unsettled_pnl: 1.536,
      mark_price: 39.267,
      est_liq_price: 496.7009894285714,
      timestamp: 1709000200265,
      imr: 0.1,
      mmr: 0.05,
      IMR_withdraw_orders: 0.1,
      MMR_with_orders: 0.05,
      pnl_24_h: 0,
      fee_24_h: 0,
      mm: 19.6335,
      notional: 392.67,
      unsettlement_pnl: 1.566,
      unrealized_pnl: 5.429999999999993,
      unsettled_pnl_ROI: 0.13639788997739244,
    },
  },
};

export default meta;

type Story = StoryObj<typeof SharePnLIcon>;

// export const Default: Story = {
//   args: {
//     position: {
//       "symbol": "PERP_AVAX_USDC",
//       "position_qty": -10,
//       "cost_position": -394.119,
//       "last_sum_unitary_funding": 0.2236,
//       "pending_long_qty": 0,
//       "pending_short_qty": 0,
//       "settle_price": 39.4119,
//       "average_open_price": 39.81,
//       "unsettled_pnl": 1.536,
//       "mark_price": 39.267,
//       "est_liq_price": 496.7009894285714,
//       "timestamp": 1709000200265,
//       "imr": 0.1,
//       "mmr": 0.05,
//       "IMR_withdraw_orders": 0.1,
//       "MMR_with_orders": 0.05,
//       "pnl_24_h": 0,
//       "fee_24_h": 0,
//       "mm": 19.6335,
//       "notional": 392.67,
//       "unsettlement_pnl": 1.566,
//       "unrealized_pnl": 5.429999999999993,
//       "unsettled_pnl_ROI": 0.13639788997739244
//     },

//   },
// };

export const Default: Story = {
  // args: {},
  render: (args) => {
    const onClick = () => {
      console.log("xxxxxxx show args", args);

      modal.show(SharePoisitionView, args);
    };

    return <button onClick={onClick}>Show share PnL</button>;
  },
};

// export const WithDialog: Story = {
//   render: (args) => {
//     const onClick = () => {
//       modal.show(SharePoisitionView, {
//         "symbol": "PERP_AVAX_USDC",
//         "position_qty": -10,
//         "cost_position": -394.119,
//         "last_sum_unitary_funding": 0.2236,
//         "pending_long_qty": 0,
//         "pending_short_qty": 0,
//         "settle_price": 39.4119,
//         "average_open_price": 39.81,
//         "unsettled_pnl": 1.536,
//         "mark_price": 39.267,
//         "est_liq_price": 496.7009894285714,
//         "timestamp": 1709000200265,
//         "imr": 0.1,
//         "mmr": 0.05,
//         "IMR_withdraw_orders": 0.1,
//         "MMR_with_orders": 0.05,
//         "pnl_24_h": 0,
//         "fee_24_h": 0,
//         "mm": 19.6335,
//         "notional": 392.67,
//         "unsettlement_pnl": 1.566,
//         "unrealized_pnl": 5.429999999999993,
//         "unsettled_pnl_ROI": 0.13639788997739244
//       });
//     };
//     return <button onClick={onClick}>Share Position</button>;
//   },
// };

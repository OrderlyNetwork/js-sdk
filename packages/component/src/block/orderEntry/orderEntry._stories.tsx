import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React, { useState } from "react";
import { OrderEntry } from ".";

import { useOrderEntry_deprecated } from "@orderly.network/hooks";

import { OrderEntity, OrderSide, OrderType } from "@orderly.network/types";

const meta: Meta = {
  title: "Block/OrderEntry",
  component: OrderEntry,
  argTypes: {
    onSubmit: { action: "submit" },
    onDeposit: { action: "deposit" },
  },

  args: {
    symbol: "PERP_NEAR_USDC",
    showConfirm: true,
    freeCollateral: 100,
    maxQty: 0,
    errors: {
      // order_quantity: "error",
    },
    symbolConfig: {
      symbol: "PERP_ETH_USDC",
      quote_min: 0,
      quote_max: 100000,
      quote_tick: 0.1,
      base_min: 0.0001,
      base_max: 260,
      base_tick: 0.0001,
      min_notional: 1,
      price_range: 0.03,
      price_scope: 0.4,
      std_liquidation_fee: 0.025,
      liquidator_fee: 0.0125,
      claim_insurance_fund_discount: 0.0075,
      funding_period: 8,
      cap_funding: 0.00375,
      floor_funding: -0.00375,
      interest_rate: 0.0001,
      created_time: 1692272828010,
      updated_time: 1692272828010,
      base_mmr: 0.0275,
      base_imr: 0.05,
      base: "ETH",
      quote: "USDC",
      type: "PERP",
    },
  },
};

export default meta;

type Story = StoryObj<typeof OrderEntry>;

export const Default: Story = {};

export const WithHook: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    const [side, setSide] = useState(OrderSide.BUY);
    const [order, setOrder] = useState<OrderEntity>({
      reduce_only: false,
      side: OrderSide.BUY,
      order_type: OrderType.LIMIT,
      symbol: symbol,
    });
    // const [reduceOnly, setReduceOnly] = useState(false);
    const formState = useOrderEntry_deprecated(order);

    console.log(formState);

    // console.log(formState.errors);

    return (
      <OrderEntry
        {...args}
        {...formState}
        symbol={symbol}
        // onSideChange={setSide}
        // reduceOnly={reduceOnly}
        onFieldChange={(field, value) => {
          if (field === "side") {
            setOrder((order) => ({
              ...order,
              [field]: value,
              order_price: undefined,
              order_quantity: undefined,
            }));
          } else {
            setOrder((order) => ({ ...order, [field]: value }));
          }
        }}
        setValues={(values) => {
          setOrder((order) => ({
            ...order,
            ...values,
          }));
        }}
      />
    );
  },
};

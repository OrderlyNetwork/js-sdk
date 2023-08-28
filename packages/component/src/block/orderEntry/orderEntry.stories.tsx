import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { OrderEntry } from ".";
import { OrderlyProvider } from "../../provider";

import { useOrderEntry } from "@orderly.network/hooks";
import { MemoryConfigStore } from "@orderly.network/core";

const meta: Meta = {
  title: "Block/OrderEntry",
  component: OrderEntry,
  argTypes: {
    onSubmit: { action: "submit" },
    onDeposit: { action: "deposit" },
  },
  decorators: [
    (Story) => (
      <OrderlyProvider configStore={new MemoryConfigStore()}>
        <Story />
      </OrderlyProvider>
    ),
  ],
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
    const formState = useOrderEntry(symbol);

    return <OrderEntry {...args} {...formState} />;
  },
};

export const WithoutOrderlyUI: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    const { onSubmit, maxQty, values, setValue, errors, markPrice } =
      useOrderEntry(symbol);
    // console.log("values", values);
    return (
      <div className="flex flex-col gap-3 text-black">
        <select
          value={values.order_type}
          onChange={(event) => {
            setValue("order_type", event.target.value);
          }}
        >
          <option value="LIMIT">Limit Order</option>
          <option value="MARKET">Market Order</option>
        </select>
        <input
          type="text"
          placeholder="price"
          value={values.order_price}
          onChange={(event) => {
            // console.log('event', event.target.value)
            setValue("order_price", event.target.value);
          }}
        />
        <input
          type="text"
          placeholder="qty"
          value={values.order_quantity}
          onChange={(event) => {
            setValue("order_quantity", event.target.value);
          }}
        />
        <input
          type="range"
          min={0}
          max={maxQty}
          onChange={(event) => {
            setValue("order_quantity", event.target.value);
          }}
        />
        <input
          type="text"
          value={values.total}
          placeholder="total"
          onChange={(event) => {
            setValue("total", event.target.value);
          }}
        />
        <button
          className="border text-white"
          onClick={() => {
            onSubmit();
          }}
        >
          Create Order
        </button>

        <div className="text-white/70 flex flex-col gap-5">
          <div>{`MarkPrice:${markPrice}`}</div>
          <div>
            <div>Values:</div>
            {JSON.stringify(values, null, 2)}
          </div>
          <div className="text-danger">
            <div>Errors:</div>
            {JSON.stringify(errors, null, 2)}
          </div>
        </div>
      </div>
    );
  },
};

import React, { FC } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { useMaxQty } from "@orderly.network/hooks";

import { OrderSide } from "@orderly.network/types";

const MaxQtyDemo: FC<{
  symbol: string;
  maxQty: number;
  side?: OrderSide;
  onSideChange?: (side: OrderSide) => void;
  reduceOnly?: boolean;
  onReduceOnlyChange?: (reduceOnly: boolean) => void;
}> = (props) => {
  return (
    <div className="orderly-text-black orderly-space-y-3">
      <div className="orderly-flex orderly-gap-5">
        <div className="orderly-flex orderly-gap-2">
          <input
            type="radio"
            id="buy"
            name="side"
            value={OrderSide.BUY}
            checked={props.side === OrderSide.BUY}
            onChange={(event) => {
              props.onSideChange?.(event.target.value as OrderSide);
            }}
          />
          <label htmlFor="buy">{OrderSide.BUY}</label>
        </div>

        <div className="orderly-flex orderly-gap-2">
          <input
            type="radio"
            id="sell"
            name="side"
            value={OrderSide.SELL}
            checked={props.side === OrderSide.SELL}
            onChange={(event) => {
              props.onSideChange?.(event.target.value as OrderSide);
            }}
          />
          <label htmlFor="sell">{OrderSide.SELL}</label>
        </div>
        <div className="orderly-flex orderly-gap-2">
          <input
            type="checkbox"
            id="reduceOnly"
            name="reduceOnly"
            value="both"
            checked={props.reduceOnly}
            onChange={(event) => {
              props.onReduceOnlyChange?.(event.target.checked);
            }}
          />
          <label htmlFor="reduceOnly">Reduce Only</label>
        </div>
      </div>
      <hr />
      <div className="orderly-flex orderly-gap-5">
        <span>Symbol:</span>
        <span>{props.symbol}</span>
      </div>
      <div className="orderly-flex orderly-gap-5">
        <span>Max Qty:</span>
        <span>{props.maxQty}</span>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/useMaxQty",
  component: MaxQtyDemo,
};

export default meta;

type Story = StoryObj<typeof MaxQtyDemo>;

export const Default: Story = {
  render: (args, { globals }) => {
    const [side, setSide] = React.useState<OrderSide>(OrderSide.BUY);
    const [reduceOnly, setReduceOnly] = React.useState<boolean>(false);
    const maxQty = useMaxQty(globals.symbol, side, reduceOnly);
    return (
      <MaxQtyDemo
        symbol={globals.symbol}
        maxQty={maxQty}
        side={side}
        onSideChange={setSide}
        reduceOnly={reduceOnly}
        onReduceOnlyChange={setReduceOnly}
      />
    );
  },
};

import { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { useOrderbookStream } from "@orderly.network/hooks";

interface OrderbookDemoProps {
  data: any;
  level: number;
}

const OrderbookDemo = (props: OrderbookDemoProps) => {
  return (
    <div className="orderly-grid orderly-grid-cols-2 orderly-text-slate-700">
      <div>
        <div className="orderly-bg-trade-profit orderly-text-white">Bids</div>
        <pre>{JSON.stringify(props.data.bids, null, 2)}</pre>
      </div>
      <div>
        <div className="orderly-bg-trade-loss orderly-text-white">Asks</div>
        <pre>{JSON.stringify(props.data.asks, null, 2)}</pre>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/useOrderbook",
  component: OrderbookDemo,
};

export default meta;
type Story = StoryObj<typeof OrderbookDemo>;

export const Default: Story = {
  render: (args, { globals }) => {
    const [data, { onDepthChange, isLoading, onItemClick, depth, allDepths }] =
      useOrderbookStream(globals.symbol, undefined, {
        level: 10,
      });
    return <OrderbookDemo data={data} level={args.level} />;
  },
  args: {
    level: 10,
  },
};

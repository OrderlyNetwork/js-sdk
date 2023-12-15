import type { Meta, StoryObj } from "@storybook/react";
import { OrdersViewFull } from ".";
import { useOrderStream } from "@orderly.network/hooks";
import React from "react";
import { OrderStatus } from "@orderly.network/types";

const meta: Meta<typeof OrdersViewFull> = {
  component: OrdersViewFull,
  title: "Block/Orders/web",
};

export default meta;
type Story = StoryObj<typeof OrdersViewFull>;

export const Default: Story = {
  args: {
    dataSource: [],
  },
};

export const withHook: Story = {
  render: (args, globals) => {
    const [symbol, setSymbol] = React.useState(globals.symbol);
    const [data, { isLoading }] = useOrderStream({
      status: OrderStatus.INCOMPLETE,
      symbol: symbol,
    });

    return <OrdersViewFull dataSource={data} isLoading={isLoading} />;
  },
};

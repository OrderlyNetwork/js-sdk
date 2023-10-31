import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { OrdersView } from ".";
import { useOrderStream, OrderStatus } from "@orderly.network/hooks";
import { OrderlyProvider } from "../../provider/orderlyProvider";
// import { OrderEditFormDialog } from "./dialog/editor";

const meta: Meta<typeof OrdersView> = {
  //   tags: ["autodocs"],
  component: OrdersView,
  title: "Block/Orders/OrdersView",
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onEditOrder: { action: "editOrder" },
    onCancelOrder: { action: "cancelOrder" },
  },
};

export default meta;

type Story = StoryObj<typeof OrdersView>;

export const Default: Story = {
  args: {
    dataSource: [],
    isLoading: false,
  },
  argTypes: {
    onCancelAll: { action: "cancelAll" },
    onEditOrder: { action: "editOrder" },
    onCancelOrder: { action: "cancelOrder" },
  },
};

export const WithHook: Story = {
  render: (args, { globals }) => {
    //
    const [symbol, setSymbol] = React.useState(globals.symbol);
    const [data, { isLoading }] = useOrderStream({
      status: OrderStatus.COMPLETED,
      symbol: symbol,
    });
    //
    return (
      <OrdersView
        dataSource={data}
        isLoading={isLoading}
        {...args}
        onShowAllSymbolChange={(value) => {
          if (value) {
            setSymbol("");
          } else {
            setSymbol(globals.symbol);
          }
        }}
        showAllSymbol={!symbol}
        symbol={globals.symbol}
      />
    );
  },
};

// export const EditOrderForm: Story = {
//   render: (args) => {
//     return (
//       <OrderEditFormDialog
//         {...args}
//         order={{}}
//         symbol="BTC-PERP"
//         onSubmit={(values) => {
//           //
//           modal.confirm({
//             title: "Edit Order",
//             content:
//               "You agree changing the quantity of ETH-PERP order to 1.0500.",
//           });
//         }}
//       ></OrderEditFormDialog>
//     );
//   },

// argTypes: {
//   onSubmit: { action: "submit" },
// },
// };

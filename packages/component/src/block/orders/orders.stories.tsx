import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { OrdersView } from ".";
import { useOrderStream, OrderStatus } from "@orderly/hooks";
import { OrderlyProvider } from "../../provider/orderlyProvider";
import { OrderEditFormDialog } from "./dialog/editor";
import { modal } from "../../modal";

const meta: Meta<typeof OrdersView> = {
  //   tags: ["autodocs"],
  component: OrdersView,
  title: "Block/OrdersView",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof OrdersView>;

export const Default: Story = {
  args: {
    dataSource: [{}],
    isLoading: false,
  },
  argTypes: {
    onCancelAll: { action: "cancelAll" },
    onEditOrder: { action: "editOrder" },
    onCancelOrder: { action: "cancelOrder" },
  },
};

export const WithData: Story = {
  render: () => {
    const { data, isLoading } = useOrderStream({
      status: OrderStatus.COMPLETED,
      // symbol: "PERP_ETH_USDC",
    });
    console.log(data);
    return (
      <OrdersView
        dataSource={data}
        isLoading={isLoading}
        onEditOrder={(order) => {
          console.log(order);
        }}
      />
    );
  },
};

export const EditOrderForm: Story = {
  render: (args) => {
    return (
      <OrderEditFormDialog
        {...args}
        order={{}}
        symbol="BTC-PERP"
        onSubmit={(values) => {
          // console.log(values);
          modal.confirm({
            title: "Edit Order",
            content:
              "You agree changing the quantity of ETH-PERP order to 1.0500.",
          });
        }}
      ></OrderEditFormDialog>
    );
  },

  // argTypes: {
  //   onSubmit: { action: "submit" },
  // },
};

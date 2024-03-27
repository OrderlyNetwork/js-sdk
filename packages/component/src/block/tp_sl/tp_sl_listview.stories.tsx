import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { TPSLListView } from "./tpsl_listview";

const meta: Meta<typeof TPSLListView> = {
  //   tags: ["autodocs"],
  component: TPSLListView,
  title: "Block/TPSL/TPSL",
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    // onEditOrder: { action: "editOrder" },
    // onCancelOrder: { action: "cancelOrder" },
  },
};

export default meta;

type Story = StoryObj<typeof TPSLListView>;

export const Default: Story = {
  args: {
    dataSource: [],
    // isLoading: false,
  },
  argTypes: {},
};

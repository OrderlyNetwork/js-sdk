import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { TPSLListView } from "./tpsl_listview";
import { TPSLList } from "./tp_sl_list";

const meta: Meta<typeof TPSLListView> = {
  //   tags: ["autodocs"],
  component: TPSLList,
  title: "Block/TPSL/list",
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    // onEditOrder: { action: "editOrder" },
    // onCancelOrder: { action: "cancelOrder" },
  },
};

export default meta;

type Story = StoryObj<typeof TPSLList>;

export const Default: Story = {
  args: {
    dataSource: [],
    // isLoading: false,
  },
  argTypes: {},
};

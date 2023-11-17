import type { Meta, StoryObj } from "@storybook/react";

import { ListView } from ".";
import { ReactNode } from "react";
import { ListTile } from "./listTile";
// @ts-ignore
import React from "react";

const meta: Meta<typeof ListView> = {
  title: "Base/ListView",
  component: ListView,
};

export default meta;

type Story = StoryObj<typeof ListView>;

export const Default: Story = {
  render: () => {
    const dataSource = [{ price: 100, time: "2021-01-01" }];
    return (
      <ListView
        dataSource={dataSource}
        renderItem={function (item: {
          price: number;
          time: string;
        }): ReactNode {
          return <div>{item.price}</div>;
        }}
      />
    );
  },
};

type PositionItem = {
  price: number;
  time: string;
  unrealizedPnl?: number;
  dialyPnl?: number;
  unsettledPnl?: number;
  notional?: number;
  availableMargin?: number;
};

export const PositionList: Story = {
  render: () => {
    const dataSource: PositionItem[] = [{ price: 100, time: "2021-01-01" }];
    return (
      <ListView<PositionItem>
        dataSource={dataSource}
        renderItem={function (item): ReactNode {
          return <div>{item.price}</div>;
        }}
      />
    );
  },
};

type OrderItem = {
  price: number;
  time: string;
};

export const OrdersList: Story = {
  render: () => {
    const dataSource: OrderItem[] = [{ price: 100, time: "2021-01-01" }];
    return (
      <ListView<OrderItem>
        dataSource={dataSource}
        renderItem={function (item): ReactNode {
          return <ListTile className="orderly-bg-red-200">{item.price}</ListTile>;
        }}
      />
    );
  },
};

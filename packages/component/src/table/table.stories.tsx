import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Table, Column } from "./";

const meta: Meta<typeof Table> = {
  title: "Base/Table",
  component: Table,
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => {
    const columns: Column[] = [
      { title: "Time", dataIndex: "time" },
      { title: "Price", dataIndex: "price" },
    ];
    const dataSource = [
      { price: 100, time: "2021-01-01" },
      { price: 100, time: "2021-01-01" },
    ];
    return (
      <Table
        bordered
        columns={columns}
        dataSource={dataSource}
        // generatedRowKey={}
        expandRowRender={(record, index) => {
          return <div className="orderly-p-3">expandRowRender</div>;
        }}
      />
    );
  },
};

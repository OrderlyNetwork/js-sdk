import React, { FC, useMemo } from "react";
import { Column, Table } from "@/table";
import { Text } from "@/text";
import { API, OrderSide } from "@orderly.network/types";

export interface TradeHistoryProps {
  dataSource?: API.Trade[] | null;
  loading?: boolean;
}

export const TradeHistory: FC<TradeHistoryProps> = (props) => {
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Time",
        dataIndex: "executed_timestamp",
        render(value, record, index) {
          return (
            <Text
              rule="date"
              formatString="HH:mm:ss"
              className="text-base-contrast/60"
            >
              {value}
            </Text>
          );
        },
      },
      {
        title: "Price",
        dataIndex: "executed_price",
        render(value, record, index) {
          return (
            <Text type={record.side === OrderSide.BUY ? "buy" : "sell"}>
              {value}
            </Text>
          );
        },
      },
      {
        title: "Size",
        dataIndex: "executed_quantity",
        align: "right" as any,
        render(value, record, index) {
          return (
            <Text type={record.side === OrderSide.BUY ? "buy" : "sell"}>
              {value}
            </Text>
          );
        },
      },
    ];
  }, []);
  return (
    <Table
      dataSource={props.dataSource}
      columns={columns}
      loading={props.loading}
      className="text-sm"
      headerClassName="text-base-contrast/40 bg-base-100"
    />
  );
};

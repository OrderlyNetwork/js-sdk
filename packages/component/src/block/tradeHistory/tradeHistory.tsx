import React, { FC, useContext, useMemo } from "react";
import { Column, Table } from "@/table";
import { Numeral, Text } from "@/text";
import { API, OrderSide } from "@orderly.network/types";
import { SymbolContext } from "@/provider";

export interface TradeHistoryProps {
  dataSource?: API.Trade[];
  loading?: boolean;
}

export const TradeHistory: FC<TradeHistoryProps> = (props) => {
  const { quote, quote_dp, base, base_dp } = useContext(SymbolContext);

  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Time",
        dataIndex: "ts",
        render(value, record, index) {
          return (
            <Text
              rule="date"
              formatString="HH:mm:ss"
              className="orderly-text-base-contrast-80"
            >
              {value}
            </Text>
          );
        },
      },
      {
        title: `Price(${quote})`,
        dataIndex: "price",
        render(value, record, index) {
          return (
            <Numeral
              precision={quote_dp}
              className={
                record.side === OrderSide.BUY
                  ? "orderly-text-success-light"
                  : "orderly-text-danger-light"
              }
            >
              {value}
            </Numeral>
          );
        },
      },
      {
        title: `Qty(${base})`,
        dataIndex: "size",
        align: "right" as any,
        render(value, record, index) {
          return (
            <Numeral
              precision={base_dp}
              className={
                record.side === OrderSide.BUY
                  ? "orderly-text-success-light"
                  : "orderly-text-danger-light"
              }
            >
              {value}
            </Numeral>
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
      className="orderly-text-3xs"
      headerClassName="orderly-text-base-contrast-36 orderly-bg-base-800"
      generatedRowKey={(record, index) =>
        // @ts-ignore
        `record.ts_${record.price}_${record.size}_${index}`
      }
    />
  );
};

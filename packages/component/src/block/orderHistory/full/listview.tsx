import { FC, useContext, useMemo, useRef } from "react";
import { Table } from "@/table";
import { Text } from "@/text";
import {
  OrderStatus,
  OrderSide,
  API,
  OrderEntity,
} from "@orderly.network/types";
import Button from "@/button";
import { cx } from "class-variance-authority";
import { upperCaseFirstLetter } from "@/utils/string";
import { OrderlyAppContext, SymbolContext, SymbolProvider } from "@/provider";
import { EndReachedBox } from "@/listView/endReachedBox";
import { Renew } from "./renew";
import { CancelButton } from "@/block/orders/full/cancelButton";
import { cn } from "@/utils";

interface Props {
  dataSource: API.OrderExt[];
  loading?: boolean;
  loadMore?: () => void;
  className?: string;
  //   status: OrderStatus;
  //   onCancelOrder?: (orderId: number, symbol: string) => Promise<any>;
}
export const Listview: FC<Props> = (props) => {
  const columns = useMemo(() => {
    const columns = [
      {
        title: "Instrument",
        dataIndex: "symbol",
        width: 120,
        className: "orderly-h-[48px] orderly-font-semibold",
        render: (value: string) => <Text rule={"symbol"}>{value}</Text>,
      },
      {
        title: "Type",
        className: "orderly-h-[48px]",
        width: 100,
        dataIndex: "type",
        formatter: upperCaseFirstLetter,
      },
      {
        title: "Side",
        className: "orderly-h-[48px]",
        width: 100,
        dataIndex: "side",
        render: (value: string, record) => (
          <span
            className={cx(
              "orderly-font-semibold",
              record.status === OrderStatus.CANCELLED
                ? ""
                : value === OrderSide.BUY
                ? "orderly-text-trade-profit"
                : "orderly-text-trade-loss"
            )}
          >
            {upperCaseFirstLetter(value)}
          </span>
        ),
      },
      {
        title: "Filled / Quantity",
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "quantity",
        width: 200,
        render: (value: string, record) => {
          return (
            <span
              className={cx(
                "orderly-font-semibold",
                record.status === OrderStatus.CANCELLED
                  ? ""
                  : record.side === OrderSide.BUY
                  ? "orderly-text-trade-profit"
                  : "orderly-text-trade-loss"
              )}
            >{`${record.executed} / ${record.quantity}`}</span>
          );
        },
      },
      {
        title: "Order Price",
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "price",
        width: 100,
        // render: (value: string, record) => <Price order={record} />,
      },
      {
        title: "Avg. price",
        width: 100,
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "average_executed_price",
      },
      {
        title: "Fee",
        width: 100,
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "total_fee",
      },
      {
        title: "Status",
        width: 120,
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "status",
        formatter: upperCaseFirstLetter,
      },
      {
        title: "Reduce",
        width: 80,
        dataIndex: "reduce_only",
        className: "orderly-h-[48px] orderly-font-semibold",
        render: (value: boolean) => {
          return <span>{value ? "Yes" : "No"}</span>;
        },
      },
      {
        title: "Hidden",
        width: 80,
        dataIndex: "visible",
        className: "orderly-h-[48px] orderly-font-semibold",
        render: (value: number, record) => {
          return <span>{value === record.quantity ? "No" : "Yes"}</span>;
        },
      },
      {
        title: "",
        dataIndex: "action",
        width: 100,
        className: "orderly-h-[48px] orderly-font-semibold !orderly-pr-2",
        align: "right",
        fixed: "right",
        render: (value: string, record) => {
          if (record.status === OrderStatus.CANCELLED) {
            return <Renew record={record} />;
          }

          if (record.status === OrderStatus.NEW) {
            return <CancelButton order={record} />;
          }

          return null;
        },
      },
    ];

    return columns;
  }, []);
  return (
    <EndReachedBox
      onEndReached={() => {
        if (!props.loading) {
          props.loadMore?.();
        }
      }}
    >
      <Table
        bordered
        justified
        columns={columns}
        loading={props.loading}
        dataSource={props.dataSource}
        headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900"
        className={cn(
          "orderly-text-2xs orderly-text-base-contrast-80",
          props.className
        )}
        generatedRowKey={(record) => record.order_id}
        onRow={(record) => {
          // console.log(record);
          if (record.status === OrderStatus.CANCELLED) {
            return {
              className: "orderly-text-base-contrast-20",
              "data-cancelled": "true",
            };
          }
          return {};
        }}
        renderRowContainer={(record, index, children) => {
          return (
            <SymbolProvider
              key={index}
              symbol={record.symbol}
              children={children}
            />
          );
        }}
      />
    </EndReachedBox>
  );
};

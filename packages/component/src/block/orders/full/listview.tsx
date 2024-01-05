import { FC, useMemo } from "react";
import { Table } from "@/table";
import { Text } from "@/text";
import { OrderStatus, OrderSide } from "@orderly.network/types";
import Button from "@/button";
import { cx } from "class-variance-authority";
import { upperCaseFirstLetter } from "@/utils/string";
import { SymbolProvider } from "@/provider";
import { NumeralWithCtx } from "@/text/numeralWithCtx";
import { CancelButton } from "./cancelButton";
import { OrderQuantity } from "./quantity";
import { Price } from "./price";
import { EndReachedBox } from "@/listView/endReachedBox";

interface Props {
  dataSource: any[];
  status: OrderStatus;
  onCancelOrder?: (orderId: number, symbol: string) => Promise<any>;
  loading?: boolean;
  loadMore?: () => void;
}
export const Listview: FC<Props> = (props) => {
  const columns = useMemo(() => {
    const columns = [
      {
        title: "Instrument",
        dataIndex: "symbol",
        className: "orderly-h-[48px]",
        render: (value: string) => <Text rule={"symbol"} className="orderly-font-semibold">{value}</Text>,
      },
      {
        title: "Type",
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "type",
        formatter: upperCaseFirstLetter,
      },
      {
        title: "Side",
        className: "orderly-h-[48px]",
        dataIndex: "side",
        render: (value: string) => (
          <span
            className={cx(
              "orderly-font-semibold",
              value === OrderSide.BUY
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
        className: "orderly-h-[48px]",
        dataIndex: "quantity",
        render: (value: string, record) => <OrderQuantity order={record} />,
      },
      {
        title: "Price",
        className: "orderly-h-[48px]",
        dataIndex: "price",
        render: (value: string, record) => <Price order={record} />,
      },
      {
        title: "Est. total",
        className: "orderly-h-[48px]",
        dataIndex: "total",
      },
      {
        title: "Reduce",
        dataIndex: "reduce_only",
        className: "orderly-h-[48px] orderly-font-semibold",
        render: (value: boolean) => {
          return <span>{value ? "Yes" : "No"}</span>;
        },
      },
      {
        title: "Hidden",
        dataIndex: "visible",
        className: "orderly-h-[48px] orderly-font-semibold",
        render: (value: number, record) => {
          return <span>{value === record.quantity ? "No" : "Yes"}</span>;
        },
      },
      {
        title: "Update",
        dataIndex: "updated_time",
        className: "orderly-h-[48px]",
        render: (value: string) => (
          <Text
            rule={"date"}
            className="orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold"
          >
            {value}
          </Text>
        ),
      },
    ];

    if (props.status === OrderStatus.INCOMPLETE) {
      columns.push({
        title: "",
        dataIndex: "action",
        className: "orderly-h-[48px]",
        align: "right",
        render: (_: string, record) => {
          return <CancelButton order={record} onCancel={props.onCancelOrder} />;
        },
      });
    }

    return columns;
  }, [props.status]);
  return (
    <EndReachedBox onEndReached={() => {
      if (!props.loading) {
        props.loadMore?.();
      }
    }}>
      <Table
        bordered
        justified
        columns={columns}
        dataSource={props.dataSource}
        headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900"
        className={"orderly-text-2xs orderly-text-base-contrast-80 orderly-min-w-[1100px] orderly-overflow-x-auto"}
        generatedRowKey={(record) => record.order_id}
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

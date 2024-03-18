import {
  API,
  AlogOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { FC, useMemo } from "react";
import { Column, Table } from "@/table";
import { Numeral, Text } from "@/text";
import { upperCaseFirstLetter } from "@/utils/string";
import { cx } from "class-variance-authority";
import { OrderQuantity } from "@/block/orders/full/quantity";
import { Price } from "@/block/orders/full/price";
import { TriggerPrice } from "@/block/orders/full/triggerPrice";
import { CancelButton } from "@/block/orders/full/cancelButton";
import { cn } from "@/utils";

interface Props {
  dataSource: any[];
  // status: OrderStatus;
  onCancelOrder?: (orderId: number, symbol: string) => Promise<any>;
  loading?: boolean;
  loadMore?: () => void;
  className?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const TPSLListView: FC<Props> = (props) => {
  const columns = useMemo(() => {
    const columns: Column<API.AlgoOrder>[] = [
      {
        title: "Instrument",
        dataIndex: "symbol",
        className: "orderly-h-[48px]",
        width: 120,
        onSort: (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r1.symbol.localeCompare(r2.symbol);
          }
          return r2.symbol.localeCompare(r1.symbol);
        },
        render: (value: string) => (
          <Text
            rule={"symbol"}
            className="orderly-font-semibold"
            onClick={(e) => {
              props.onSymbolChange?.({ symbol: value } as API.Symbol);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {value}
          </Text>
        ),
      },
      {
        title: "Type",
        width: 100,
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "type",
        formatter: (value: string, record: any) => {
          if (record.algo_order_id) {
            return (
              `Stop ` + `${record.type.replace("_ORDER", "")}`.toLowerCase()
            );
          }
          return upperCaseFirstLetter(value);
        },
      },
      {
        title: "Side",
        width: 100,
        className: "orderly-h-[48px]",
        dataIndex: "side",
        onSort: (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r2.side.localeCompare(r1.side);
          }
          return r1.side.localeCompare(r2.side);
        },
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
        className:
          "orderly-h-[48px] orderly-ui-pending-list-input-container orderly-ui-pending-list-quantity-input-container",
        dataIndex: "quantity",
        width: 120,
        onSort: props.status === OrderStatus.INCOMPLETE,
        render: (value: string, record: any) => (
          <OrderQuantity order={record} />
        ),
      },
      {
        title: "Price",
        className:
          "orderly-h-[48px] orderly-ui-pending-list-input-container rderly-ui-pending-list-price-input-container",
        dataIndex: "price",
        width: 120,
        onSort: props.status === OrderStatus.INCOMPLETE,
        render: (value: string, record: any) => <Price order={record} />,
      },
      {
        title: "Trigger",
        className:
          "orderly-h-[48px] orderly-ui-pending-list-input-container orderly-ui-pending-list-trigger-input-container",
        dataIndex: "trigger_price",
        width: 120,
        // onSort: props.status === OrderStatus.INCOMPLETE,
        render: (value: string, record: any) => <TriggerPrice order={record} />,
      },
      {
        title: "Est. total",
        width: 100,
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "executed",
        render: (value: string, record: any) => {
          return (
            <Numeral
              className={
                "orderly-font-semibold orderly-text-2xs orderly-text-base-contrast-80"
              }
              precision={2}
            >
              {record.quantity === 0 ||
              Number.isNaN(record.price) ||
              record.price === null
                ? "--"
                : `${record.quantity * record.price}`}
            </Numeral>
          );
        },
      },
      {
        title: "Reduce",
        dataIndex: "reduce_only",
        width: 100,
        className: "orderly-h-[48px] orderly-font-semibold",
        render: (value: boolean) => {
          return <span>{value ? "Yes" : "No"}</span>;
        },
      },
      {
        title: "Hidden",
        dataIndex: "visible",
        width: 100,
        className: "orderly-h-[48px] orderly-font-semibold",
        render: (value: number, record) => {
          // @ts-ignore
          return <span>{record.visible_quantity !== 0 ? "No" : "Yes"}</span>;
        },
      },
      {
        title: "Order time",
        dataIndex: "created_time",
        width: 150,
        onSort: props.status === OrderStatus.INCOMPLETE,
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
      {
        title: "",
        dataIndex: "action",
        className: "orderly-h-[48px]",
        align: "right",
        fixed: "right",
        width: 100,
        render: (_: string, record) => {
          if (props.status === OrderStatus.INCOMPLETE) {
            // return <CancelButton order={record} />;
          }
          return null;
        },
      },
    ];

    // columns.push();

    return columns;
  }, []);

  return (
    <div className="orderly-h-full orderly-overflow-y-auto">
      <Table<API.AlgoOrder>
        headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900"
        className={cn(
          "orderly-text-2xs orderly-text-base-contrast-80",
          props.className
        )}
        columns={columns}
        dataSource={props.dataSource}
      />
    </div>
  );
};

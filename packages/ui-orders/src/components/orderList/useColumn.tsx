import { API, OrderSide, OrderStatus } from "@orderly.network/types";
import { Button, cn, Column, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useMemo } from "react";
import { upperCaseFirstLetter } from "../../utils/util";

export const useOrderColumn = (
  status: OrderStatus = OrderStatus.INCOMPLETE
) => {
  const cols = useMemo(() => {
    return [];
  }, []);

  const columns: Column<API.Order>[] = [
    {
      title: "Instrument",
      dataIndex: "symbol",
      className: "orderly-h-[48px]",
      width: 120,
      onSort:
        status === OrderStatus.INCOMPLETE
          ? (r1, r2, sortOrder) => {
              if (sortOrder === "asc") {
                return r1.symbol.localeCompare(r2.symbol);
              }
              return r2.symbol.localeCompare(r1.symbol);
            }
          : undefined,
      render: (value: string) => (
        <Text.formatted
          rule={"symbol"}
          className="orderly-font-semibold"
          onClick={(e) => {
            // props.onSymbolChange?.({ symbol: value } as API.Symbol);
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          {value}
        </Text.formatted>
      ),
    },
    {
      title: "Type",
      width: 100,
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "type",
      formatter: (value: string, record: any) => {
        const type =
          typeof record.type === "string"
            ? record.type.replace("_ORDER", "").toLowerCase()
            : record.type;
        if (record.algo_order_id) {
          return `Stop ${type}`;
        }
        return upperCaseFirstLetter(value);
      },
    },
    {
      title: "Side",
      width: 100,
      className: "orderly-h-[48px]",
      dataIndex: "side",
      onSort:
        status === OrderStatus.INCOMPLETE
          ? (r1, r2, sortOrder) => {
              if (sortOrder === "asc") {
                return r2.side.localeCompare(r1.side);
              }
              return r1.side.localeCompare(r2.side);
            }
          : undefined,
      render: (value: string) => (
        <span
          className={cn(
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
      onSort: status === OrderStatus.INCOMPLETE,
      render: (value: string, record: any) => {
        // return <OrderQuantity order={record} />;
        return value;
      },
    },
    {
      title: "Price",
      className:
        "orderly-h-[48px] orderly-ui-pending-list-input-container rderly-ui-pending-list-price-input-container",
      dataIndex: "price",
      width: 120,
      onSort: status === OrderStatus.INCOMPLETE,
      render: (value: string, record: any) => {
        // return (<Price order={record} />);
        return value;
      },
    },
    {
      title: "Trigger",
      className:
        "orderly-h-[48px] orderly-ui-pending-list-input-container orderly-ui-pending-list-trigger-input-container",
      dataIndex: "trigger_price",
      width: 120,
      // onSort: status === OrderStatus.INCOMPLETE,
      render: (value: string, record: any) =>
        // <TriggerPrice order={record} />
        value,
    },
    {
      title: "Est. total",
      width: 100,
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "executed",
      render: (value: string, record: any) => {
        return (
          <Text.numeral
            className={
              "orderly-font-semibold orderly-text-2xs orderly-text-base-contrast-80"
            }
            dp={2}
            rm={Decimal.ROUND_DOWN}
          >
            {record.quantity === 0 ||
            Number.isNaN(record.price) ||
            record.price === null
              ? "--"
              : `${record.quantity * record.price}`}
          </Text.numeral>
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
      onSort: status === OrderStatus.INCOMPLETE,
      className: "orderly-h-[48px]",
      render: (value: string) => (
        <Text.formatted
          rule={"date"}
          formatString="yyyy-MM-dd HH:mm:ss"
          className="orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold"
        >
          {value}
        </Text.formatted>
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
        if (status === OrderStatus.INCOMPLETE) {
          // return <CancelButton order={record} />;
          return <Button>Cancel</Button>;
        }
        return null;
      },
    },
  ];

  // columns.push();

  return columns;

  return cols;
};

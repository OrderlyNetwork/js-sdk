import { API, OrderSide, OrderStatus } from "@orderly.network/types";
import { Renew } from "../orderHistory/full/renew";
import { CancelButton } from "./full/cancelButton";
import { upperCaseFirstLetter } from "@/utils/string";
import { Numeral, Text } from "@/text";
import { cx } from "class-variance-authority";
import { Column } from "@/table";
import { NumeralWithCtx } from "@/text/numeralWithCtx";

/// get columns for cancel/fill/reject/history
export const columnsBasis = (status?: OrderStatus): Column<API.Order>[] => {
  const columns: Column<API.Order>[] = [
    {
      title: "Instrument",
      dataIndex: "symbol",
      width: 120,
      className: "orderly-h-[48px] orderly-font-semibold",
      render: (value: string) => <Text rule={"symbol"}>{value}</Text>,
    },
    {
      title: "Type",
      width: 100,
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "type",
      formatter: (value: string, record: any) => {
        if (record.algo_order_id) {
          return `Stop ` + `${record.type}`.toLowerCase();
        }
        return upperCaseFirstLetter(value);
      },
    },
    {
      title: "Side",
      className: "orderly-h-[48px]",
      width: 100,
      dataIndex: "side",
      render: (value: string, record: any) => (
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
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "quantity",
      width: 200,
      render: (value: string, record: any) => {
        return (
          <span
            className={cx(
              "orderly-font-semibold",
              record.side === OrderSide.BUY
                ? "orderly-text-trade-profit"
                : "orderly-text-trade-loss"
            )}
          >{`${record.total_executed_quantity} / ${record.quantity}`}</span>
        );
      },
    },
    {
      title: "Order Price",
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "price",
      width: 100,
      render: (value: string, record: any) => {
        return (
          <NumeralWithCtx
            className={
              "orderly-font-semibold orderly-text-2xs"
            }
          >
            {value || "-"}
          </NumeralWithCtx>
        );
      },
    },
    {
      title: "Avg. price",
      width: 100,
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "average_executed_price",
      render: (value: string, record: any) => {
        return (
          <NumeralWithCtx
            className={
              "orderly-font-semibold orderly-text-2xs"
            }
          >
            {value || "-"}
          </NumeralWithCtx>
        );
      },
    },
    {
      title: "Est. total",
      width: 100,
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "executed",
      render: (value: string, record: any) => {
        return (
          <NumeralWithCtx
            className={
              "orderly-font-semibold orderly-text-2xs"
            }
            // precision={2}
          >
            {record.executed === 0 ||
            Number.isNaN(record.price) ||
            record.price === null
              ? "-"
              : `${record.executed * record.price}`}
          </NumeralWithCtx>
        );
      },
    },
    {
      title: "Trigger",
      width: 100,
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "trigger_price",
      render: (value: string, record: any) => {
        return (
          <NumeralWithCtx
            className={
              "orderly-font-semibold orderly-text-2xs"
            }
            // precision={2}
          >
            {value}
          </NumeralWithCtx>
        );
      },
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
      formatter: (value: string, record: any) => {
        const status = value || record.algo_status;

        if (status === "NEW") {
          return upperCaseFirstLetter("pending");
        }
        return upperCaseFirstLetter(status);
      },
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
      render: (value: number, record: any) => {
        return <span>{value === record.quantity ? "No" : "Yes"}</span>;
      },
    },
  ];

  if (status !== OrderStatus.REJECTED && status !== OrderStatus.FILLED) {
    columns.push({
      title: "",
      dataIndex: "action",
      width: 120,
      className: "orderly-h-[48px] orderly-font-semibold !orderly-pr-2",
      align: "right",
      fixed: "right",
      render: (value: string, record: any) => {
        if (record.status === OrderStatus.CANCELLED) {
          return <Renew record={record} />;
        }

        if (record.status === OrderStatus.NEW) {
          return <CancelButton order={record} />;
        }

        return null;
      },
    });
  }

  return columns;
};

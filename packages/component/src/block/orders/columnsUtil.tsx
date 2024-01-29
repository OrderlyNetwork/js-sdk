import { API, OrderSide, OrderStatus } from "@orderly.network/types";
import { Renew } from "../orderHistory/full/renew";
import { CancelButton } from "./full/cancelButton";
import { upperCaseFirstLetter } from "@/utils/string";
import { Numeral,Text } from "@/text";
import { cx } from "class-variance-authority";
import { Column } from "@/table";

/// get columns for cancel/fill/reject/history
export const columnsBasis = (): Column<API.Order>[] => {
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
          render: (value: string, record: any) => (
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
          render: (value: string, record: any) => {
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
              <Numeral
                className={"orderly-font-semibold orderly-text-2xs orderly-text-base-contrast-80"}
                precision={2}
              >
                {value || "-"}
              </Numeral>
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
              <Numeral
                className={"orderly-font-semibold orderly-text-2xs orderly-text-base-contrast-80"}
                precision={2}
              >
                {value || "-"}
              </Numeral>
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
              <Numeral
                className={"orderly-font-semibold orderly-text-2xs orderly-text-base-contrast-80"}
                precision={2}
              >
                {record.executed === 0 || Number.isNaN(record.price) || record.price === null ? "-" : `${record.executed * record.price}`}
              </Numeral>
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
              <Numeral
                className={"orderly-font-semibold orderly-text-2xs orderly-text-base-contrast-80"}
                precision={2}
              >
                {value}
              </Numeral>
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
        {
          title: "",
          dataIndex: "action",
          width: 100,
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
        },
      ];
  
      return columns;
};
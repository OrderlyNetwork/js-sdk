import {
  API,
  AlgoOrderType,
  OrderSide,
  OrderStatus,
} from "@orderly.network/types";
import { Renew } from "../orderHistory/full/renew";
import { CancelButton } from "./full/cancelButton";
import { upperCaseFirstLetter } from "@/utils/string";
import { Text } from "@/text";
import { cx } from "class-variance-authority";
import { Column } from "@/table";
import { NumeralWithCtx } from "@/text/numeralWithCtx";
import { OrderType } from "@orderly.network/types";

/// get columns for cancel/fill/reject/history
export const columnsBasis = (props: {
  status?: OrderStatus;
  onSymbolChange?: (symbol: API.Symbol) => void;
}): Column<API.Order | API.AlgoOrder>[] => {
  const { status, onSymbolChange } = props || {};
  const columns: Column<API.Order | API.AlgoOrder>[] = [
    {
      title: "Instrument",
      dataIndex: "symbol",
      width: 120,
      className: "orderly-h-[48px] orderly-font-semibold",

      render: (value: string) => (
        <Text
          rule={"symbol"}
          onClick={(e) => {
            onSymbolChange?.({ symbol: value } as API.Symbol);
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
        if (!!record.parent_algo_type) {
          if (record.algo_type === AlgoOrderType.STOP_LOSS) {
            return record.type === OrderType.CLOSE_POSITION
              ? `Position SL`
              : "SL";
          }

          if (record.algo_type === AlgoOrderType.TAKE_PROFIT) {
            return record.type === OrderType.CLOSE_POSITION
              ? `Position TP`
              : "TP";
          }
        }

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
        if (
          record.type === OrderType.CLOSE_POSITION &&
          record.status !== OrderStatus.FILLED
        ) {
          return "Entire position";
        }
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
        if (
          record.type === "MARKET" ||
          record.trigger_price_type === "MARK_PRICE"
        ) {
          return <span>Market</span>;
        }
        return (
          <NumeralWithCtx className={"orderly-font-semibold orderly-text-2xs"}>
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
          <NumeralWithCtx className={"orderly-font-semibold orderly-text-2xs"}>
            {value || "-"}
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
            className={"orderly-font-semibold orderly-text-2xs"}
            // precision={2}
          >
            {value}
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
        if (
          record.type === OrderType.CLOSE_POSITION &&
          record.status !== OrderStatus.FILLED
        ) {
          return "Entire position";
        }

        return (
          <NumeralWithCtx
            className={"orderly-font-semibold orderly-text-2xs"}
            // precision={2}
          >
            {record.total_executed_quantity === 0 ||
            Number.isNaN(record.average_executed_price) ||
            record.average_executed_price === null
              ? "-"
              : `${
                  record.total_executed_quantity * record.average_executed_price
                }`}
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
        return <span>{record.visible_quantity !== 0 ? "No" : "Yes"}</span>;
      },
    },
    {
      title: "Order time",
      dataIndex: "created_time",
      width: 150,
      // onSort: status === OrderStatus.INCOMPLETE,
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

        if (
          record.status === OrderStatus.NEW ||
          record.algo_status === OrderStatus.NEW
        ) {
          return <CancelButton order={record} />;
        }

        return null;
      },
    });
  }

  return columns;
};

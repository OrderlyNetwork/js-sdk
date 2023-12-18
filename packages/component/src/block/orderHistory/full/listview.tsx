import { FC, useMemo } from "react";
import { Table } from "@/table";
import { Text } from "@/text";
import { OrderStatus, OrderSide, API } from "@orderly.network/types";
import Button from "@/button";
import { cx } from "class-variance-authority";
import { upperCaseFirstLetter } from "@/utils/string";
import { SymbolProvider } from "@/provider";
import { NumeralWithCtx } from "@/text/numeralWithCtx";
// import { CancelButton } from "./cancelButton";
// import { OrderQuantity } from "./quantity";
// import { Price } from "./price";

interface Props {
  dataSource: API.OrderExt[];
  loading?: boolean;
  //   status: OrderStatus;
  //   onCancelOrder?: (orderId: number, symbol: string) => Promise<any>;
}
export const Listview: FC<Props> = (props) => {
  const columns = useMemo(() => {
    const columns = [
      {
        title: "Instrument",
        dataIndex: "symbol",
        className: "orderly-h-[48px] orderly-font-semibold",
        render: (value: string) => <Text rule={"symbol"}>{value}</Text>,
      },
      {
        title: "Type",
        className: "orderly-h-[48px]",
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
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "quantity",
        render: (value: string, record) => {
          return (
            <span
              className={cx(
                "orderly-font-semibold",
                record.side === OrderSide.BUY
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
        // render: (value: string, record) => <Price order={record} />,
      },
      {
        title: "Avg.price",
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "average_executed_price",
      },
      {
        title: "Fee",
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "total_fee",
      },
      {
        title: "Status",
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "status",
        formatter: upperCaseFirstLetter,
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
        title: "",
        dataIndex: "action",
        className: "orderly-h-[48px] orderly-font-semibold",
        align: "right",
        render: (value: string, record) => {
          if (record.status === OrderStatus.CANCELLED) {
            return (
              <Button size={"small"} variant={"outlined"} color={"tertiary"}>
                Renew
              </Button>
            );
          }

          return null;
        },
      },
      //   {
      //     title: "Update",
      //     dataIndex: "updated_time",
      //     className: "orderly-h-[48px]",
      //     render: (value: string) => (
      //       <Text
      //         rule={"date"}
      //         className="orderly-break-normal orderly-whitespace-nowrap"
      //       >
      //         {value}
      //       </Text>
      //     ),
      //   },
    ];

    // if (props.status === OrderStatus.INCOMPLETE) {
    //   columns.push({
    //     title: "",
    //     dataIndex: "action",
    //     className: "orderly-h-[48px]",
    //     align: "right",
    //     render: (_: string, record) => {
    //       return <CancelButton order={record} onCancel={props.onCancelOrder} />;
    //     },
    //   });
    // }

    return columns;
  }, []);
  return (
    <Table
      bordered
      justified
      columns={columns}
      loading={props.loading}
      dataSource={props.dataSource}
      headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900"
      className={"orderly-text-2xs orderly-text-base-contrast-80"}
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
  );
};

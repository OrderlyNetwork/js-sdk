import { FC, useMemo } from "react";
import { Table } from "@/table";
import { Text } from "@/text";
import { OrderStatus, OrderSide } from "@orderly.network/types";
import Button from "@/button";
import { cx } from "class-variance-authority";
import { upperCaseFirstLetter } from "@/utils/string";

interface Props {
  dataSource: any[];
  status: OrderStatus;
}
export const Listview: FC<Props> = (props) => {
  const columns = useMemo(() => {
    const columns = [
      {
        title: "instrument",
        dataIndex: "symbol",
        className: "orderly-h-[48px]",
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
        title: "Filled/Quantity",
        className: "orderly-h-[48px]",
        dataIndex: "quantity",
      },
      {
        title: "Price",
        className: "orderly-h-[48px]",
        dataIndex: "price",
      },
      {
        title: "Est.total",
        className: "orderly-h-[48px]",
        dataIndex: "total",
      },
      {
        title: "Reduce",
        dataIndex: "reduce_only",
        className: "orderly-h-[48px]",
        render: (value: boolean) => {
          return <span>{value ? "Yes" : "No"}</span>;
        },
      },
      {
        title: "Hidden",
        dataIndex: "visible",
        className: "orderly-h-[48px]",
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
            className="orderly-break-normal orderly-whitespace-nowrap"
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
        render: (value: string, record) => {
          return (
            <Button
              size="small"
              variant={"outlined"}
              color={"tertiary"}
              onClick={() => {
                console.log("cancel", record);
              }}
            >
              Cancel
            </Button>
          );
        },
      });
    }

    return columns;
  }, [props.status]);
  return (
    <Table
      bordered
      justified
      columns={columns}
      dataSource={props.dataSource}
      headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3"
      className={"orderly-text-2xs orderly-text-base-contrast-80"}
      generatedRowKey={(record) => record.order_id}
    />
  );
};

import { Table } from "@/table";
import { FC, useMemo } from "react";
import { PositionsViewProps } from "@/block";
import { Numeral, Text } from "@/text";
import { Input } from "@/input";
import Button from "@/button";

export const Listview: FC<PositionsViewProps> = (props) => {
  const columns = useMemo(() => {
    return [
      {
        title: "instrument",
        dataIndex: "symbol",
        className: "orderly-h-[48px]",
        render: (value: string) => <Text rule={"symbol"}>{value}</Text>,
      },
      {
        title: "Quantity",
        className: "orderly-h-[48px]",
        dataIndex: "position_qty",
        render: (value: string) => <Numeral coloring>{value}</Numeral>,
      },
      {
        title: "Avg.open",
        className: "orderly-h-[48px]",
        dataIndex: "average_open_price",
      },
      {
        title: "Mark price",
        dataIndex: "mark_price",
        className: "orderly-h-[48px]",
        render: (value: string) => {
          return <Numeral>{value}</Numeral>;
        },
      },
      {
        title: "Liq.price",
        className: "orderly-h-[48px]",
        dataIndex: "est_liq_price",
        render: (value: string) => {
          return <Numeral className="orderly-text-warning">{value}</Numeral>;
        },
      },
      {
        title: "Margin",
        className: "orderly-h-[48px]",
        dataIndex: "mm",
      },
      {
        title: "Unreal.PnL",
        className: "orderly-h-[48px]",
        dataIndex: "unrealized_pnl",
        render: (value: string) => <Numeral coloring>{value}</Numeral>,
      },
      {
        title: "Daily real.",
        className: "orderly-h-[48px]",
        dataIndex: "open_price",
      },
      {
        title: "Notional",
        dataIndex: "notional",
        className: "orderly-h-[48px]",
      },
      {
        title: "Qty.",
        dataIndex: "close_qty",
        className: "orderly-w-[86px] orderly-h-[48px]",
        render: (value: string, record) => {
          return <Input value={record.position_qty} size={"small"} />;
        },
      },
      {
        title: "Price",
        dataIndex: "close_price",
        className: "orderly-w-[86px] orderly-h-[48px]",
        render: (value: string) => <Input value={value} size={"small"} />,
      },
      {
        title: "",
        dataIndex: "close_position",
        align: "right",
        className: "orderly-w-[80px] orderly-h-[48px]",
        render: (value: string) => {
          return (
            <Button
              size={"small"}
              variant={"outlined"}
              color={"tertiary"}
              fullWidth
            >
              Close
            </Button>
          );
        },
      },
    ];
  }, []);

  return (
    <Table
      bordered
      columns={columns}
      dataSource={props.dataSource}
      headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3"
      className={"orderly-text-2xs orderly-text-base-contrast-80"}
      generatedRowKey={(record) => record.symbol}
      justified
    />
  );
};

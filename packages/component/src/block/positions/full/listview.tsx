import { Table } from "@/table";
import { FC, useMemo } from "react";
import { PositionsViewProps } from "@/block";

export const Listview: FC<PositionsViewProps> = (props) => {
  const columns = useMemo(() => {
    return [
      {
        title: "instrument",
        dataIndex: "symbol",
      },
      {
        title: "Quantity",
        dataIndex: "quantity",
      },
      {
        title: "Avg.open",
        dataIndex: "open_price",
      },
      {
        title: "Mark price",
        dataIndex: "open_price",
      },
      {
        title: "Liq.price",
        dataIndex: "open_price",
      },
      {
        title: "Margin",
        dataIndex: "open_price",
      },
      {
        title: "Unreal.PnL",
        dataIndex: "open_price",
      },
      {
        title: "Daily real.",
        dataIndex: "open_price",
      },
      {
        title: "Notional",
        dataIndex: "notional",
      },
      {
        title: "Qty.",
        dataIndex: "qty",
      },
      {
        title: "Price",
        dataIndex: "price",
      },
    ];
  }, []);
  return <Table columns={columns} dataSource={[]} />;
};

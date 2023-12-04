import { useMemo } from "react";
import { Table } from "@/table";

export const Listview = () => {
  const columns = useMemo(() => {
    return [
      {
        title: "instrument",
        dataIndex: "symbol",
      },
      {
        title: "Type",
        dataIndex: "type",
      },
      {
        title: "Side",
        dataIndex: "side",
      },
      {
        title: "Filled/Quantity",
        dataIndex: "quantity",
      },
      {
        title: "Price",
        dataIndex: "price",
      },
      {
        title: "Est.total",
        dataIndex: "total",
      },
      {
        title: "Reduce",
        dataIndex: "reduce",
      },
      {
        title: "Hidden",
        dataIndex: "hidden",
      },
      {
        title: "Update",
        dataIndex: "update",
      },
    ];
  }, []);
  return <Table columns={columns} dataSource={[]} />;
};

import { useMemo } from "react";
import { type Column } from "@orderly.network/ui";

export const useColumns = () => {
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Token",
        dataIndex: "symbole",
      },
      {
        title: "Time",
        dataIndex: "time",
        // formatter: "date",
      },
      {
        title: "TxID",
        dataIndex: "id",
        // formatter: "date",
      },
      {
        title: "Status",
        dataIndex: "id",
        // formatter: "date",
      },
      {
        title: "Type",
        dataIndex: "id",
        // formatter: "date",
      },
      {
        title: "Amount",
        dataIndex: "id",
        // formatter: "date",
      },
    ];
  }, []);

  return columns;
};

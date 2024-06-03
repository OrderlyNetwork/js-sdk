import { useMemo } from "react";

import { type Column } from "@orderly.network/ui";

export const useColumns = () => {
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Instrument",
        dataIndex: "instrument",
      },
      {
        title: "Time",
        dataIndex: "time",
        // formatter: "date",
      },
    ];
  }, []);

  return columns;
};

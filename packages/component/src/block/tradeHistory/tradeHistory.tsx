import { Table } from "@/table";
import React, { FC, useMemo } from "react";

export interface TradingHistoryProps {
  dataSource: any[];
}

export const TradingHistory: FC<TradingHistoryProps> = (props) => {
  const columns = useMemo(() => {
    return [];
  }, []);
  return <Table dataSource={props.dataSource} columns={columns} />;
};

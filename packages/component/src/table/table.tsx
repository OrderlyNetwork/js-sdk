import { FC, useMemo } from "react";
import { Row } from "./row";
import type { Column } from "./col";
import { THead } from "./thead";

export interface TableProps<RecordType> {
  columns: Column[];
  dataSource: RecordType[];
  /**
   * @description 加载中
   * @default false
   */
  loading?: boolean;
}

export const Table = <RecordType extends unknown>(
  props: TableProps<RecordType>
) => {
  const rows = useMemo(() => {
    return props.dataSource.map((record, index) => {
      return <Row key={index} columns={props.columns} record={record} />;
    });
  }, [props.dataSource, props.columns]);

  return (
    <table className="border-collapse w-full">
      <thead>
        <THead columns={props.columns} />
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};

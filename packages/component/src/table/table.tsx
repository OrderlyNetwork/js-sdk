import { FC, useMemo } from "react";
import { Row } from "./row";
import type { Column } from "./col";
import { THead } from "./thead";
import { cn } from "@/utils/css";
import { Spinner } from "@/spinner";

export interface TableProps<RecordType> {
  columns: Column[];
  dataSource?: RecordType[];
  /**
   * @description 加载中
   * @default false
   */
  loading?: boolean;
  className?: string;
  headerClassName?: string;

  bordered?: boolean;

  gerenatedRowKey?: (record: RecordType, index: number) => string;
}

export const Table = <RecordType extends unknown>(
  props: TableProps<RecordType>
) => {
  const rows = useMemo(() => {
    return props.dataSource?.map((record: any, index) => {
      const key =
        typeof props.gerenatedRowKey === "function"
          ? props.gerenatedRowKey(record, index)
          : index; /// `record.ts_${record.price}_${record.size}_${index}`;
      return <Row key={key} columns={props.columns} record={record} />;
    });
  }, [props.dataSource, props.columns, props.gerenatedRowKey]);

  const maskElement = useMemo(() => {
    if (props.loading) {
      return (
        <div className="absolute w-full h-full z-20 left-0 top-0 bottom-0 right-0 flex justify-center items-center">
          <Spinner />
        </div>
      );
    }

    if (!!props.dataSource?.length) return null;
    return (
      <div className="absolute left-0 top-0 right-0 bottom-0 flex items-center justify-center z-10">
        <div className="text-center text-base-contrast/50">No Data</div>
      </div>
    );
  }, [props.dataSource]);

  return (
    <div className="relative min-h-[180px] h-full">
      <table className={cn("border-collapse w-full", props.className)}>
        <THead
          columns={props.columns}
          className={props.headerClassName}
          bordered={props.bordered}
        />

        <tbody>{rows}</tbody>
      </table>
      {maskElement}
    </div>
  );
};

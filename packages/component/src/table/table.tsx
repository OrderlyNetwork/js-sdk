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
        <div className="orderly-absolute orderly-w-full orderly-h-full orderly-z-20 orderly-left-0 orderly-top-0 orderly-bottom-0 orderly-right-0 orderly-flex orderly-justify-center orderly-items-center">
          <Spinner />
        </div>
      );
    }

    if (!!props.dataSource?.length) return null;
    return (
      <div className="orderly-absolute orderly-left-0 orderly-top-0 orderly-right-0 orderly-bottom-0 orderly-flex orderly-items-center orderly-justify-center orderly-z-10">
        <div className="orderly-text-center orderly-text-base-contrast/50">No Data</div>
      </div>
    );
  }, [props.dataSource]);

  return (
    <div className="orderly-relative orderly-min-h-[180px] orderly-h-full">
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

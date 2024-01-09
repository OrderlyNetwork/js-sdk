import { FC, ReactNode, useMemo } from "react";
import { Row } from "./row";
import type { Column } from "./col";
import { THead } from "./thead";
import { cn } from "@/utils/css";
import { Spinner } from "@/spinner";
import { EmptyView } from "@/listView/emptyView";

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

  justified?: boolean;

  renderRowContainer?: (
    record: RecordType,
    index: number,
    children: ReactNode
  ) => React.ReactNode;

  generatedRowKey?: (record: RecordType, index: number) => string;
}

export const Table = <RecordType extends unknown>(
  props: TableProps<RecordType>
) => {
  const rows = useMemo(() => {
    return props.dataSource?.map((record: any, index) => {
      const key =
        typeof props.generatedRowKey === "function"
          ? props.generatedRowKey(record, index)
          : index; /// `record.ts_${record.price}_${record.size}_${index}`;

      const row = (
        <Row
          key={key}
          columns={props.columns}
          record={record}
          justified={props.justified}
          bordered={props.bordered}
        />
      );

      if (typeof props.renderRowContainer === "function") {
        return props.renderRowContainer(record, index, row);
      }

      return row;
    });
  }, [props.dataSource, props.columns, props.generatedRowKey]);

  const maskElement = useMemo(() => {
    let children = <EmptyView visible={props.dataSource?.length === 0} />;
    if (props.loading) {
      children = <Spinner />;
    }

    return (
      <div className="orderly-absolute orderly-w-full orderly-h-full orderly-z-20 orderly-left-0 orderly-top-[40px] orderly-bottom-0 orderly-right-0 orderly-flex orderly-justify-center orderly-items-center">
        {children}
      </div>
    );
    // if (!!props.dataSource?.length) return null;
    // return <EmptyView visible={props.dataSource?.length === 0} />;
  }, [props.dataSource]);

  return (
    <div className="orderly-relative orderly-min-h-[180px] orderly-h-full">
      <table
        className={cn(
          "orderly-border-collapse orderly-w-full orderly-table-fixed orderly-min-h-[180px]",
          props.className
        )}
      >
        <colgroup>
          {props.columns.map((col, index) => {
            return (
              <col key={index} className={col.className} align={col.align} />
            );
          })}
        </colgroup>
        <THead
          columns={props.columns}
          className={props.headerClassName}
          bordered={props.bordered}
          justified={props.justified}
        />

        <tbody>{rows}</tbody>
      </table>
      {maskElement}
    </div>
  );
};

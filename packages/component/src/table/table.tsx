import { FC, ReactNode, useMemo } from "react";
import { Row } from "./row";
import type { Column } from "./col";
import { TableHeader } from "./thead";
import { cn } from "@/utils/css";
import { Spinner } from "@/spinner";
import { EmptyView } from "@/listView/emptyView";
import { ColGroup } from "./colgroup";

export interface TableProps<RecordType> {
  columns: Column<RecordType>[];
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
    if (props.loading || !!props.dataSource?.length) return null;

    let content: ReactNode = <EmptyView />;
    if (props.loading) {
      content = <Spinner />;
    }
    return (
      <div className="orderly-absolute orderly-w-full orderly-z-20 orderly-left-0 orderly-top-0 orderly-bottom-0 orderly-right-0 orderly-flex orderly-justify-center orderly-items-center">
        {content}
      </div>
    );
  }, [props.dataSource]);

  return (
    <div
      className={
        "orderly-relative orderly-h-full orderly-flex-col orderly-overflow-x-auto"
      }
    >
      <div className={cn("orderly-h-full", props.className)}>
        <TableHeader
          columns={props.columns}
          // containerClassName={props.className}
          className={props.headerClassName}
          bordered={props.bordered}
          justified={props.justified}
        />
        <div
          className="orderly-flex-1 orderly-relative orderly-overflow-x-hidden orderly-overflow-y-auto"
          style={{ height: `calc(100% - 45px)` }}
        >
          <table
            className={cn(
              "orderly-border-collapse orderly-w-full orderly-table-fixed"
            )}
          >
            <ColGroup columns={props.columns} />

            <tbody>{rows}</tbody>
          </table>
          {maskElement}
        </div>
      </div>
    </div>
  );
};

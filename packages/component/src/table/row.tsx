import { FC, ReactNode, useContext, useMemo } from "react";
import { Col, Column } from "./col";
import { cn } from "@/utils/css";
import { ExpandRow } from "./expandRow";

interface RowProps<RecordType> {
  columns: Column<RecordType>[];
  record: any;
  bordered?: boolean;
  justified?: boolean;
  index: number;
  rowKey: string;
  onRow?: (record: any, index: number) => any;
  expanded: boolean;
  canExpand?: boolean;
  expandRowRender?: (record: RecordType, index: number) => ReactNode;
  onToggleExpand: (key: string) => void;
}

export const Row = <RecordType,>(props: RowProps<RecordType>) => {
  const { columns, record, index, bordered } = props;

  const cols = useMemo(() => {
    return columns.map((column, index) => {
      return (
        <Col
          key={column.dataIndex}
          col={column}
          index={index}
          record={record}
          justified={props.justified}
        />
      );
    });
  }, [columns, record]);

  const rowAttrs = useMemo(() => {
    if (typeof props.onRow === "function") {
      return props.onRow(record, index);
    }
    return {};
  }, [record, index]);

  const { className, ...rest } = rowAttrs;

  return (
    <>
      <tr
        className={cn(
          "hover:orderly-bg-base-800 orderly-group",
          props.bordered &&
            "orderly-border-b orderly-border-divider last:orderly-border-b-0",
          props.canExpand && "orderly-cursor-pointer",
          className
        )}
        onClick={(event) => {
          if (!props.canExpand) return;
          props.onToggleExpand(props.rowKey);
          event.preventDefault();
          event.stopPropagation();
        }}
        {...rest}
      >
        {cols}
      </tr>
      {props.expanded && (
        <ExpandRow
          columns={columns}
          expandRowRender={props.expandRowRender}
          record={record}
          index={index}
          bordered={bordered}
        />
      )}
    </>
  );
};

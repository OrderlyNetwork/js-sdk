import { CSSProperties, FC, ReactNode, useContext, useMemo } from "react";
import { TableCell } from "../table";
import { cnBase } from "tailwind-variants";
import { withFixedStyle } from "./colHOC";

export type ColumnFixed = "left" | "right";

export type SortOrder = "asc" | "desc";

export type TableCellFormatter<T> =
  | string
  | ((value: any, record: T, index: number) => any);

export type TableCellRenderer<T> =
  | string
  | ((value: any, record: T, index: number) => React.ReactNode);

export type Column<RecordType extends unknown = any> = {
  title: string;
  hint?: ReactNode;
  hintClassName?: string;
  width?: number;
  fixed?: ColumnFixed;
  dataIndex: string;
  className?: string | ((record: RecordType, index: number) => string);
  align?: "left" | "center" | "right";
  onSort?:
    | boolean
    | ((r1: RecordType, r2: RecordType, sortOrder: SortOrder) => number);
  formatter?: TableCellFormatter<RecordType>;
  render?: TableCellRenderer<RecordType>;
  getKey?: (record: RecordType, index: number) => string;
};

export interface ColProps {
  col: Column;
  record: any;
  index: number;
  justified?: boolean;
  style?: CSSProperties;
}

export const ColItem: FC<ColProps> = (props) => {
  const { col, record, index, style } = props;
  const { align } = col;

  const content = useMemo(() => {
    const { col } = props;
    const { dataIndex, formatter, render } = col;
    let value = props.record[dataIndex];
    if (typeof formatter === "function") {
      value = formatter(value, props.record, props.index);
    }
    if (typeof render === "function") {
      return render(value, props.record, props.index);
    }
    return value;
  }, [col, record]);

  return (
    <TableCell
      className={cnBase(
        props.justified && "first:oui-pl-0 last:oui-pr-0",
        // col.className,
        align === "right" && "oui-text-right",
        col.fixed && "oui-sticky oui-z-10"
      )}
      style={{
        backgroundColor: col.fixed
          ? "var(--oui-table-background-color)"
          : "transparent",
        ...style,
      }}
    >
      {content}
    </TableCell>
  );
};

export const Col = withFixedStyle(ColItem);

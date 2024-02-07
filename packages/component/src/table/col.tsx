import { CSSProperties, FC, ReactNode, useContext, useMemo } from "react";
import { cn } from "@/utils/css";

import { withFixedStyle } from "./colHOC";

export type ColumnFixed = "left" | "right";

export type SortOrder = "asc" | "desc";

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
  formatter?: (value: any, record: RecordType, index: number) => any;
  render?: (value: any, record: RecordType, index: number) => React.ReactNode;
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
    if (formatter) {
      value = formatter(value, props.record, props.index);
    }
    if (render) {
      return render(value, props.record, props.index);
    }
    return value;
  }, [col, record]);

  return (
    <td
      className={cn(
        "orderly-py-[2px] orderly-px-1 whitespace-nowrap group-hover:!orderly-bg-base-800",
        props.justified && "first:orderly-pl-0 last:orderly-pr-0",
        col.className,
        align === "right" && "orderly-text-right",
        col.fixed && "orderly-sticky"
      )}
      style={{
        backgroundColor: col.fixed
          ? "var(--table-background-color)"
          : "transparent",
        ...style,
      }}
    >
      {content}
    </td>
  );
};

export const Col = withFixedStyle(ColItem);

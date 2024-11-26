import { ReactNode } from "react";
import { NumeralProps, type NumeralRule } from "../typography/numeral";
import { FormattedTextProps, TextRule } from "../typography/formatted";
export { type Column as TanstackColumn } from "@tanstack/react-table";

export type ColumnFixed = "left" | "right";

export type SortOrder = "asc" | "desc";

export type TableCellFormatter<T> =
  | string
  | ((value: any, record: T, index: number) => any);

export type TableCellRenderer<T> =
  | string
  | ((value: any, record: T, index: number) => React.ReactNode);

export type Column<RecordType extends unknown = any> = {
  type?: "data" | "action" | "group";
  title?: ReactNode;
  hint?: ReactNode;
  hintClassName?: string;
  width?: number;
  fixed?: ColumnFixed;
  dataIndex: string;
  className?: string | ((record: RecordType, index: number) => string);
  align?: "left" | "center" | "right";
  onSort?:
    | boolean
    | ((r1: RecordType, r2: RecordType, sortOrder?: SortOrder) => number);
  formatter?: TableCellFormatter<RecordType>;
  render?: TableCellRenderer<RecordType>;
  getKey?: (record: RecordType, index: number) => string;

  /**
   * text rule for formatted text, if provided, the text will be rendered as formatted text component;
   */
  rule?: TextRule | NumeralRule;
  numeralProps?:
    | Omit<NumeralProps, "children" | "as" | "rule">
    | ((
        value: any,
        record: RecordType,
        index: number
      ) => Omit<NumeralProps, "children" | "as" | "rule">);
  /**
   * text props for formatted text
   */
  textProps?:
    | Omit<FormattedTextProps, "children" | "as" | "rule">
    | ((
        value: any,
        record: RecordType,
        index: number
      ) => Omit<FormattedTextProps, "children" | "as" | "rule">);
};

export type PaginationMeta = {
  count?: number;
  page: number;
  pageSize: number;
  pageTotal?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export type TableSort = { sortKey: string; sort: SortOrder };

export type DataTableClassNames = {
  root?: string;
  header?: string;
  body?: string;
  footer?: string;
  pagination?: string;
  scroll?: string;
};

import { CSSProperties, FC, ReactNode, useMemo } from "react";
import { TableCell } from "../table";
import { cnBase } from "tailwind-variants";
import { withFixedStyle } from "./colHOC";
import {
  FormattedTextProps,
  isTextRule,
  type TextRule,
} from "../../typography/formatted";
import { FormattedText } from "../../typography/formatted";
import {
  Numeral,
  NumeralProps,
  isNumeralRule,
  type NumeralRule,
} from "../../typography/numeral";

export type ColumnFixed = "left" | "right";

export type SortOrder = "asc" | "desc";

export type TableCellFormatter<T> =
  | string
  | ((value: any, record: T, index: number) => any);

export type TableCellRenderer<T> =
  | string
  | ((value: any, record: T, index: number) => React.ReactNode);

export type Column<RecordType extends unknown = any> = {
  title: ReactNode;
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

  /**
   * text rule for formatted text, if provided, the text will be rendered as formatted text component;
   */
  rule?: TextRule | NumeralRule;
  numeralProps?: Omit<NumeralProps, "children" | "as" | "rule">;
  /**
   * text props for formatted text
   */
  textProps?: Omit<FormattedTextProps, "children" | "as" | "rule">;
};

export interface ColProps {
  col: Column;
  record: any;
  index: number;
  justified?: boolean;
  style?: CSSProperties;
}

export const ColItem: FC<ColProps> = (props) => {
  const { col, record, index, style, ...rest } = props;
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

    if (typeof col.rule !== "undefined") {
      if (isTextRule(col.rule)) {
        return (
          <FormattedText
            rule={col.rule}
            {...col.textProps}
            // copyable={col.copyable}
          >
            {value}
          </FormattedText>
        );
      }

      if (isNumeralRule(col.rule)) {
        return (
          <Numeral rule={col.rule} {...col.numeralProps}>
            {value}
          </Numeral>
        );
      }
    }

    return value;
  }, [col, record]);

  const colClassName = useMemo(() => {
    if (typeof col.className === "function") {
      return col.className(record, index);
    }
    return col.className;
  }, [col, record, index]);

  return (
    <TableCell
      className={cnBase(
        props.justified && "first:oui-pl-0 last:oui-pr-0",
        colClassName,
        align === "right" && "oui-text-right",
        align === "center" && "oui-text-center",
        col.fixed && "oui-sticky oui-z-10"
      )}
      style={{
        backgroundColor: col.fixed
          ? "var(--oui-table-background-color)"
          : "transparent",
        ...style,
      }}
      {...rest}
    >
      {content}
    </TableCell>
  );
};

export const Col = withFixedStyle(ColItem);

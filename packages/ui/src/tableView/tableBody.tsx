import React, { Fragment, ReactNode } from "react";
import { cnBase } from "tailwind-variants";
import { flexRender, Row } from "@tanstack/react-table";
import { getColumnPinningProps } from "./utils/getColumnPinningProps";
import { columnVariants, tableVariants } from "./className";
import { TableViewProps } from "./tableView";

export type TableBodyProps<RecordType> = {
  className?: string;
  rows: Row<RecordType>[];
  bordered?: boolean;
  justified?: boolean;
} & Pick<
  TableViewProps<any>,
  | "border"
  | "bordered"
  | "size"
  | "onRow"
  | "renderRowContainer"
  | "expandRowRender"
>;

export const TableBody: React.FC<TableBodyProps<any>> = (props) => {
  return (
    <table
      className={cnBase("oui-w-full", "oui-table-fixed oui-border-collapse")}
    >
      <tbody className={cnBase("oui-table-tbody", props.className)}>
        {props.rows.map((row) => {
          const { className, onClick, ...rest } =
            typeof props.onRow === "function"
              ? props.onRow(row.original, row.index)
              : {};

          const rowView = (
            <Fragment key={row.id}>
              <tr
                {...rest}
                key={row.id}
                className={cnBase(
                  "oui-table-tbody-tr",
                  "oui-group oui-rounded",
                  // "hover:oui-bg-line-4"
                  "hover:oui-bg-base-8",
                  tableVariants({ size: props.size }),
                  props.border?.body && "oui-border-b oui-border-b-line-4",
                  className
                )}
                onClick={(event) => {
                  if (row.getCanExpand()) {
                    row.getToggleExpandedHandler();
                  }
                  onClick?.();
                }}
              >
                {row.getVisibleCells().map((cell) => {
                  const column = cell.column;
                  const isPinned = column.getIsPinned();
                  const { style: pinStyle, className: pinClassName } =
                    getColumnPinningProps(column);
                  const { align, className: rowClassName } =
                    column.columnDef.meta || ({} as any);

                  return (
                    <td
                      key={cell.id}
                      style={pinStyle}
                      className={cnBase(
                        "oui-table-tbody-td",
                        "oui-px-3",
                        columnVariants({ align }),
                        // isPinned && "group-hover:oui-bg-line-4",
                        isPinned && "group-hover:oui-bg-8",
                        pinClassName,
                        rowClassName
                      )}
                    >
                      {
                        flexRender(
                          column.columnDef.cell,
                          cell.getContext()
                        ) as ReactNode
                      }
                    </td>
                  );
                })}
              </tr>

              {row.getIsExpanded() && (
                <tr className="oui-z-0">
                  <td colSpan={row.getVisibleCells().length}>
                    {props.expandRowRender?.(row, row.index)}
                  </td>
                </tr>
              )}
            </Fragment>
          );

          if (typeof props.renderRowContainer === "function") {
            return (
              <Fragment key={row.id}>
                {props.renderRowContainer(row.original, row.index, rowView)}
              </Fragment>
            );
          }

          return rowView;
        })}
      </tbody>
    </table>
  );
};

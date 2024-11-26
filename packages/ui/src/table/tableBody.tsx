import React, { FC, Fragment } from "react";
import { cnBase } from "tailwind-variants";
import { Row } from "@tanstack/react-table";
import { getColumnPinningProps } from "./utils/getColumnPinningProps";
import { alignVariants } from "./className";
import { DataTableProps } from "./dataTable";
import { TableCell } from "./tableCell";

type TableBodyProps<RecordType> = {
  className?: string;
  rows: Row<RecordType>[];
  justified?: boolean;
  showLeftShadow?: boolean;
  showRightShadow?: boolean;
} & Pick<
  DataTableProps<any>,
  "bordered" | "onRow" | "renderRowContainer" | "expandRowRender"
>;

export const TableBody: React.FC<TableBodyProps<any>> = (props) => {
  return (
    <tbody
      className={cnBase(
        "oui-table-tbody oui-relative",
        "oui-text-base-contrast-80",
        props.className
      )}
    >
      {props.rows.map((row) => {
        const { className, onClick, ...rest } =
          typeof props.onRow === "function"
            ? props.onRow(row.original, row.index)
            : {};

        const rowView = (
          <Fragment key={row.id}>
            <tr
              key={row.id}
              className={cnBase(
                "oui-table-tbody-tr oui-group oui-h-10",
                props.bordered && "oui-border-b oui-border-b-line-4",
                className
              )}
              onClick={(event) => {
                if (row.getCanExpand()) {
                  row.getToggleExpandedHandler();
                }
                onClick?.();
              }}
              {...rest}
            >
              {row.getVisibleCells().map((cell) => {
                const column = cell.column;
                const { style: pinStyle, classNames: pinClassNames } =
                  getColumnPinningProps(column);
                const { align, className: rowClassName } =
                  column.columnDef.meta || ({} as any);

                return (
                  <td
                    key={cell.id}
                    style={pinStyle}
                    className={cnBase(
                      "oui-table-tbody-td oui-relative",
                      "oui-px-3",
                      alignVariants({ align }),
                      rowClassName,
                      pinClassNames.content,
                      props.showLeftShadow && pinClassNames.leftShadow,
                      props.showRightShadow && pinClassNames.rightShadow
                    )}
                  >
                    <TableCell cell={cell} />
                    <CellHover
                      selected={row.getIsSelected()}
                      isFirst={column.getIsFirstColumn()}
                      isLast={column.getIsLastColumn()}
                    />
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
  );
};

type CellHoverProps = {
  selected: boolean;
  isFirst: boolean;
  isLast: boolean;
};

const CellHover: FC<CellHoverProps> = ({ selected, isFirst, isLast }) => {
  return (
    <div
      className={cnBase(
        "oui-absolute oui-top-0 oui-left-0 oui-z-[-1]",
        "oui-w-full oui-h-full",
        "group-hover:oui-bg-line-4",
        selected && "oui-bg-line-6 group-hover:oui-bg-line-6",
        isFirst && "oui-rounded-l",
        isLast && "oui-rounded-r"
      )}
    />
  );
};

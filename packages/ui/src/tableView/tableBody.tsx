import React, { FC, Fragment } from "react";
import { cnBase } from "tailwind-variants";
import { Row } from "@tanstack/react-table";
import { getColumnPinningProps } from "./utils/getColumnPinningProps";
import { columnVariants, bodySizeVariants } from "./className";
import { TableViewProps } from "./tableView";
import { TableCell } from "./tableCell";
import { BodySize } from "./type";

type TableBodyProps<RecordType> = {
  className?: string;
  rows: Row<RecordType>[];
  justified?: boolean;
  size?: BodySize;
} & Pick<
  TableViewProps<any>,
  "bordered" | "onRow" | "renderRowContainer" | "expandRowRender"
>;

export const TableBody: React.FC<TableBodyProps<any>> = (props) => {
  return (
    <tbody
      className={cnBase(
        "oui-table-tbody",
        "oui-text-base-contrast-80 oui-relative oui-min-h-[277px]",
        props.className
      )}
    >
      {props.rows.map((row) => {
        const { className, onClick, ...rest } =
          typeof props.onRow === "function"
            ? props.onRow(row.original, row.index)
            : {};

        const selected = row.getIsSelected();

        const rowView = (
          <Fragment key={row.id}>
            <tr
              key={row.id}
              className={cnBase(
                "oui-table-tbody-tr",
                "oui-group oui-rounded",
                "hover:oui-bg-line-4",
                selected && "oui-bg-line-6 hover:oui-bg-line-6",
                props.bordered && "oui-border-b oui-border-b-line-4",
                bodySizeVariants({ size: props.size }),
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
                      "oui-table-tbody-td oui-relative",
                      "oui-px-3",
                      columnVariants({ align }),
                      pinClassName,
                      rowClassName
                    )}
                  >
                    <TableCell cell={cell} />
                    {isPinned && <PinnedCellHover selected={selected} />}
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

const PinnedCellHover: FC<{ selected: boolean }> = ({ selected }) => {
  return (
    <div
      className={cnBase(
        "oui-absolute oui-top-0 oui-left-0 oui-z-[-1]",
        "oui-w-full oui-h-full",
        "group-hover:oui-bg-line-4",
        selected && "oui-bg-line-6 group-hover:oui-bg-line-6"
      )}
    />
  );
};

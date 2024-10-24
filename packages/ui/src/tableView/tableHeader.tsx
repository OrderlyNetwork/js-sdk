import React, { FC, ReactNode } from "react";
import { cnBase } from "tailwind-variants";
import { getColumnPinningProps } from "./utils/getColumnPinningProps";
import { TableColumn } from "./type";
import { AscendingIcon, DescendingIcon, SortingIcon } from "./icons";
import { flexRender, HeaderGroup, SortDirection } from "@tanstack/react-table";
import { TableViewProps } from "./tableView";
import { columnVariants } from "./className";

type TableHeaderProps = {
  className?: string;
  headerGroups: HeaderGroup<any>[];
} & Pick<TableViewProps<any>, "bordered" | "border">;

export const TableHeader: React.FC<TableHeaderProps> = (props) => {
  return (
    <table
      className={cnBase("oui-w-full", " oui-table-fixed oui-border-collapse")}
    >
      <thead className={props.className}>
        {props.headerGroups.map((headerGroup) => (
          <tr key={headerGroup.id} className={cnBase("oui-table-thead-tr")}>
            {headerGroup.headers.map((header) => {
              const column = header.column;
              const { align, className: rowClassName } =
                column.columnDef.meta || ({} as any);

              const { style: pinStyle, className: pinClassName } =
                getColumnPinningProps(column, true);

              return (
                <th
                  key={header.id}
                  style={pinStyle}
                  className={cnBase(
                    "oui-table-thead-th",
                    " oui-whitespace-nowrap",
                    "oui-px-3 oui-py-[3px] oui-h-10",
                    columnVariants({ align }),
                    (props.bordered || props.border?.header?.bottom) &&
                      "oui-border-b oui-border-line",
                    pinClassName,
                    rowClassName
                  )}
                >
                  <div
                    className={cnBase(
                      "oui-inline-flex oui-items-center oui-gap-x-1",
                      column.getCanSort() &&
                        "oui-cursor-pointer oui-select-none"
                    )}
                    onClick={column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : (flexRender(
                          column.columnDef.header,
                          header.getContext()
                        ) as ReactNode)}

                    <SortIndicator column={column} />
                  </div>
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
    </table>
  );
};

const SortIndicator: FC<{ column: TableColumn<any> }> = ({ column }) => {
  if (column.getCanSort()) {
    return (
      {
        asc: <AscendingIcon />,
        desc: <DescendingIcon />,
      }[column.getIsSorted() as SortDirection] || <SortingIcon />
    );
  }
  return null;
};

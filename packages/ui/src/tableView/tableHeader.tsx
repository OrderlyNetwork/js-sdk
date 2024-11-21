import { FC } from "react";
import { cnBase } from "tailwind-variants";
import { getColumnPinningProps } from "./utils/getColumnPinningProps";
import { TanstackColumn } from "./type";
import { AscendingIcon, DescendingIcon, SortingIcon } from "./icons";
import { HeaderGroup, SortDirection } from "@tanstack/react-table";
import { TableViewProps } from "./tableView";
import { alignVariants } from "./className";

type TableHeaderProps = {
  className?: string;
  headerGroups: HeaderGroup<any>[];
  showLeftShadow?: boolean;
  showRightShadow?: boolean;
} & Pick<TableViewProps<any>, "bordered">;

export const TableHeader: FC<TableHeaderProps> = (props) => {
  return (
    <thead
      className={cnBase(
        "oui-table-thead",
        "oui-sticky oui-top-0 oui-z-[2]",
        "oui-bg-[var(--oui-table-background-color)]",
        "oui-text-base-contrast-36"
      )}
    >
      {props.headerGroups.map((headerGroup) => (
        <tr
          key={headerGroup.id}
          className={cnBase("oui-table-thead-tr", "oui-h-10", props.className)}
        >
          {headerGroup.headers.map((header) => {
            const column = header.column;
            const {
              align,
              className: rowClassName,
              title,
            } = column.columnDef.meta || ({} as any);

            const { style: pinStyle, classNames: pinClassNames } =
              getColumnPinningProps(column, true);

            const canSort = column.getCanSort();
            const isSorted = column.getIsSorted();

            return (
              <th
                key={header.id}
                style={pinStyle}
                className={cnBase(
                  "oui-table-thead-th",
                  "oui-whitespace-nowrap",
                  "oui-px-3",
                  props.bordered &&
                    "after:oui-block after:oui-absolute after:oui-w-full after:oui-h-full after:oui-top-0 after:oui-left-0 after:oui-z-[-1] after:oui-border-b after:oui-border-line",
                  // use border-b will show bottom element content
                  // props.bordered && "oui-border-b oui-border-line"
                  alignVariants({ align }),
                  rowClassName,
                  pinClassNames.content,
                  props.showLeftShadow && pinClassNames.leftShadow,
                  props.showRightShadow && pinClassNames.rightShadow
                )}
              >
                {header.isPlaceholder ? null : (
                  <div
                    className={cnBase(
                      "oui-inline-flex oui-items-center oui-gap-x-1",
                      canSort &&
                        "oui-cursor-pointer oui-select-none hover:oui-text-base-contrast-80"
                    )}
                    onClick={column.getToggleSortingHandler()}
                  >
                    {title}
                    {canSort && (
                      <SortIndicator isSorted={isSorted as SortDirection} />
                    )}
                  </div>
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};

const SortIndicator: FC<{ isSorted: SortDirection }> = ({ isSorted }) => {
  return (
    {
      asc: <AscendingIcon />,
      desc: <DescendingIcon />,
    }[isSorted] || <SortingIcon />
  );
};

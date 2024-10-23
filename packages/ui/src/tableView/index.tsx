import {
  CSSProperties,
  Fragment,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  Column as TableColumn,
  getExpandedRowModel,
  Row,
  getSortedRowModel,
  SortDirection,
  PaginationState,
  OnChangeFn,
} from "@tanstack/react-table";
import { Column, SortOrder } from "./type";
import { cnBase, tv, VariantProps } from "tailwind-variants";
import { Transform } from "./transform";
import { useWrap } from "./hooks/useWrap";
import { AscendingIcon, DescendingIcon, SortingIcon } from "./icons";
import { useSyncScroll } from "./hooks/useSyncScroll";
import { Pagination } from "./pagination";

export type TanstackTableProps<RecordType> = {
  columns: Column<RecordType>[];
  dataSource?: RecordType[] | null;
  /**
   * @description loading state
   * @default false
   */
  loading?: boolean;
  isValidating?: boolean;
  ignoreLoadingCheck?: boolean;
  className?: string;
  classNames?: {
    root?: string;
    header?: string;
    body?: string;
    footer?: string;
  };
  showMaskElement?: boolean;
  emptyView?: ReactNode;
  bordered?: boolean;
  loadMore?: () => void;
  onSort?: (options?: { sortKey: string; sort: SortOrder }) => void;
  initialSort?: { sortKey: string; sort: SortOrder };
  id?: string;
  minHeight?: number;
  initialMinHeight?: number;
  getRowCanExpand?: (row: Row<any>) => boolean;
  renderRowExpand?: (row: Row<any>) => ReactNode;
  manualSorting?: boolean;
  manualPagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  border?: {
    header?: {
      top?: boolean;
      bottom?: boolean;
    };
    body?: boolean;
  };
} & VariantProps<typeof tableVariants>;

const tableVariants = tv({
  variants: {
    size: {
      sm: "oui-h-7",
      md: "oui-h-10",
      lg: "oui-h-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const columnVariants = tv({
  variants: {
    align: {
      left: "oui-text-left",
      center: "oui-text-center",
      right: "oui-text-right",
    },
  },
  defaultVariants: {
    align: "left",
  },
});

const getColumnPinningProps = (
  column: TableColumn<any>,
  isHeader?: boolean
) => {
  const isPinned = column.getIsPinned();
  const isLastLeftPinnedColumn =
    isPinned === "left" && column.getIsLastColumn("left");
  const isFirstRightPinnedColumn =
    isPinned === "right" && column.getIsFirstColumn("right");

  const style: CSSProperties = {
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    width: column.getSize(),
  };

  const fixedCls = cnBase(
    "before:oui-block before:oui-absolute before:oui-w-[32px] before:oui-h-full",
    "before:oui-top-0 before:oui-z-[-1]",
    "before:oui-bg-[linear-gradient(90deg,rgba(7,8,10,0.80)_0%,rgba(7,8,10,0.36)_65%,rgba(7,8,10,0.00)_100%)]"
  );

  const hoverCls = cnBase(
    "after:oui-block after:oui-absolute after:oui-w-[6px] after:oui-h-full",
    "after:oui-top-0 after:oui-right-[-6px] after:oui-bg-[var(--oui-table-background-color)]"
  );

  const className = cnBase(
    isPinned ? "oui-sticky" : "oui-relative",
    isPinned ? "oui-z-[1]" : "oui-z-0",
    isPinned === "right" && isHeader && "oui-translate-x-[-6px]",
    // !isPinned && !isHeader && "oui-translate-x-[-6px]",
    isPinned && "oui-bg-[var(--oui-table-background-color)]",
    isPinned && !isHeader && "group-hover:oui-bg-base-8",
    isLastLeftPinnedColumn && cnBase(fixedCls, "before:oui-right-[-32px]"),
    isFirstRightPinnedColumn &&
      cnBase(
        fixedCls,
        "before:oui-left-[-32px] before:oui-rotate-180",
        isHeader && hoverCls
      )
  );

  return {
    style,
    className,
  };
};

export function TableView<RecordType extends any>(
  props: PropsWithChildren<TanstackTableProps<RecordType>>
) {
  const {
    columns,
    className,
    classNames,
    size,
    pagination,
    onPaginationChange,
    getRowCanExpand,
    manualSorting,
    manualPagination,
  } = props;

  const formatColumns = useMemo(() => Transform.columns(columns), [columns]);

  const columnPinning = useMemo(
    () => Transform.columnPinning(columns),
    [columns]
  );

  const { state: paginationState, config: paginationConfig } = useMemo(
    () => Transform.pagination(pagination),
    [pagination]
  );

  const table = useReactTable({
    data: props.dataSource!,
    columns: formatColumns,
    state: {
      columnPinning,
      ...paginationState,
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
    getSortedRowModel: getSortedRowModel(),
    // use pre-sorted row model instead of sorted row model
    manualSorting,
    // turn off client-side pagination
    manualPagination,
    ...paginationConfig,
  });

  const wrapRef = useWrap();

  const { theadRef, tbodyRef } = useSyncScroll();

  return (
    <div
      ref={wrapRef}
      className={cnBase(
        "oui-table-root",
        "oui-overflow-hidden oui-px-3",
        "oui-bg-base-9 oui-w-full oui-h-full",
        "oui-text-xs",
        props.border?.header?.top && "oui-border-t oui-border-line",
        className,
        classNames?.root
      )}
    >
      <div ref={theadRef} className={cnBase("oui-overflow-x-hidden")}>
        <table
          className={cnBase("oui-w-full oui-table-fixed oui-border-collapse")}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="oui-table-thead-tr">
                {headerGroup.headers.map((header) => {
                  const column = header.column;
                  const { align } = column.columnDef.meta || ({} as any);
                  const { style: pinStyle, className: pinClassName } =
                    getColumnPinningProps(column, true);

                  const renderSortIndicator = (column: TableColumn<any>) => {
                    if (column.getCanSort()) {
                      return (
                        {
                          asc: <AscendingIcon />,
                          desc: <DescendingIcon />,
                        }[column.getIsSorted() as SortDirection] || (
                          <SortingIcon />
                        )
                      );
                    }
                    return null;
                  };
                  return (
                    <th
                      key={header.id}
                      style={pinStyle}
                      className={cnBase(
                        "oui-table-thead-th",
                        "oui-text-base-contrast-36 oui-font-semibold oui-whitespace-nowrap",
                        "oui-px-3 oui-py-[3px] oui-h-10",
                        columnVariants({ align }),
                        (props.bordered || props.border?.header?.bottom) &&
                          "oui-border-b oui-border-line",
                        pinClassName,
                        classNames?.header
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
                        {renderSortIndicator(column)}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
        </table>
      </div>
      <div
        ref={tbodyRef}
        className={cnBase(
          "oui-w-full",
          "oui-overflow-auto oui-custom-scrollbar",
          pagination
            ? "oui-max-h-[calc(100%_-_80px)]"
            : "oui-max-h-[calc(100%_-_40px)]"
        )}
      >
        <table
          className={cnBase(
            "oui-w-full oui-h-full",
            "oui-table-fixed oui-border-collapse"
          )}
        >
          <tbody className="oui-table-tbody">
            {table.getRowModel().rows.map((row) => {
              return (
                <Fragment key={row.id}>
                  <tr
                    key={row.id}
                    className={cnBase(
                      "oui-table-tbody-tr",
                      tableVariants({ size }),
                      "oui-group oui-rounded",
                      // "hover:oui-bg-line-4"
                      "hover:oui-bg-base-8",
                      props.border?.body && "oui-border-b oui-border-b-line-4"
                    )}
                    onClick={
                      row.getCanExpand()
                        ? row.getToggleExpandedHandler()
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const column = cell.column;
                      const isPinned = column.getIsPinned();
                      const { style: pinStyle, className: pinClassName } =
                        getColumnPinningProps(column);
                      const { align } = column.columnDef.meta || ({} as any);

                      return (
                        <td
                          key={cell.id}
                          style={pinStyle}
                          className={cnBase(
                            "oui-table-tbody-td",
                            "oui-text-base-contrast-80 oui-font-semibold",
                            "oui-px-3",
                            columnVariants({ align }),
                            // isPinned && "group-hover:oui-bg-line-4",
                            isPinned && "group-hover:oui-bg-8",
                            pinClassName
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
                        {props.renderRowExpand?.(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          count={props.dataSource?.length!}
          pageTotal={table.getPageCount()}
          page={pagination.pageIndex}
          pageSize={pagination.pageSize}
          onPageChange={(pageIndex) => {
            onPaginationChange?.({ ...pagination, pageIndex });
          }}
          onPageSizeChange={(pageSize) => {
            onPaginationChange?.({ ...pagination, pageSize, pageIndex: 1 });
          }}
        />
      )}
    </div>
  );
}

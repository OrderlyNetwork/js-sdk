import { PropsWithChildren, ReactNode, useMemo, useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  Row,
  getSortedRowModel,
  PaginationState,
  OnChangeFn,
  CoreOptions,
  ColumnFiltersState,
  ColumnFilter,
  getFilteredRowModel,
  RowSelectionState,
} from "@tanstack/react-table";
import { Column, SortOrder } from "./type";
import { cnBase, VariantProps } from "tailwind-variants";
import { Transform } from "./transform";
import { useWrap } from "./hooks/useWrap";
import { useSyncScroll } from "./hooks/useSyncScroll";
import { TablePagination } from "./tablePagination";
import { TableHeader } from "./tableHeader";
import { TableBody } from "./tableBody";
import { tableVariants } from "./className";
import { useInit } from "./hooks/useInit";
import { TablePlaceholder } from "./tablePlaceholder";

export type TableViewProps<RecordType> = {
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
    pagination?: string;
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
  expandRowRender?: (row: Row<any>, index: number) => ReactNode;
  manualSorting?: boolean;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  border?: {
    header?: {
      top?: boolean;
      bottom?: boolean;
    };
    body?: boolean;
  };
  renderRowContainer?: (
    record: RecordType,
    index: number,
    children: ReactNode
  ) => ReactNode;
  generatedRowKey?: CoreOptions<any>["getRowId"];
  onRow?: (record: RecordType, index: number) => any;
  columnFilters?: ColumnFilter | ColumnFilter[];
  rowSelection?: RowSelectionState;
} & VariantProps<typeof tableVariants>;

export function TableView<RecordType extends any>(
  props: PropsWithChildren<TableViewProps<RecordType>>
) {
  const {
    dataSource,
    columns,
    className,
    classNames,
    pagination,
    onPaginationChange,
    getRowCanExpand,
    manualSorting,
    manualPagination,
    loading,
    ignoreLoadingCheck,
    emptyView,
  } = props;

  const formatColumns = useMemo(() => Transform.columns(columns), [columns]);

  const columnPinning = useMemo(
    () => Transform.columnPinning(columns),
    [columns]
  );

  const rowSelection = useMemo(
    () => props.rowSelection || {},
    [props.rowSelection]
  );

  const { state: paginationState, config: paginationConfig } = useMemo(
    () => Transform.pagination(pagination),
    [pagination]
  );
  const initialized = useInit({ dataSource, loading, ignoreLoadingCheck });

  const columnFilters = useMemo(() => {
    return Array.isArray(props.columnFilters)
      ? (props.columnFilters as ColumnFilter[])
      : props.columnFilters
      ? [props.columnFilters]
      : [];
  }, [props.columnFilters]);

  const table = useReactTable({
    data: dataSource!,
    columns: formatColumns,
    state: {
      columnPinning,
      columnFilters,
      rowSelection,
      ...paginationState,
    },
    // onColumnFiltersChange: setColumnFilters,
    getRowId: props.generatedRowKey,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // use pre-sorted row model instead of sorted row model
    manualSorting,
    // turn off client-side pagination
    manualPagination,
    // only allow a single row to be selected at once
    enableMultiRowSelection: false,
    ...paginationConfig,
  });

  const wrapRef = useWrap();

  const { theadRef, tbodyRef, isYScroll } = useSyncScroll();

  const showPagination = pagination && !!dataSource?.length;

  const showPlaceholder =
    ((dataSource?.length ?? 0) === 0 || loading) && initialized;

  return (
    <div
      ref={wrapRef}
      className={cnBase(
        "oui-table-root",
        "oui-overflow-hidden oui-px-3",
        "oui-bg-base-9 oui-w-full oui-h-full",
        "oui-text-xs oui-font-semibold",
        props.border?.header?.top && "oui-border-t oui-border-line",
        className,
        classNames?.root
      )}
    >
      <div
        ref={theadRef}
        className={cnBase("oui-overflow-x-hidden", "oui-text-base-contrast-36")}
      >
        {initialized && !!dataSource?.length && (
          <TableHeader
            className={classNames?.header}
            headerGroups={table.getHeaderGroups()}
            bordered={props.bordered}
            border={props.border}
          />
        )}
      </div>
      <div
        ref={tbodyRef}
        className={cnBase(
          "oui-text-base-contrast-80 oui-relative",
          "oui-overflow-auto oui-custom-scrollbar",
          isYScroll ? "oui-w-[calc(100%_+_6px)]" : "oui-w-full",
          showPagination
            ? "oui-h-[calc(100%_-_80px)]"
            : "oui-h-[calc(100%_-_40px)]"
        )}
      >
        <TableBody
          className={classNames?.body}
          rows={table.getRowModel().rows}
          bordered={props.bordered}
          border={props.border}
          size={props.size}
          renderRowContainer={props.renderRowContainer}
          expandRowRender={props.expandRowRender}
        />
        <TablePlaceholder
          visible={showPlaceholder}
          loading={loading}
          emptyView={emptyView}
        />
      </div>

      {showPagination && (
        <TablePagination
          className={classNames?.pagination}
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

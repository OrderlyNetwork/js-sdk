import {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCoreRowModel,
  useReactTable,
  getExpandedRowModel,
  Row,
  getSortedRowModel,
  CoreOptions,
  ColumnFilter,
  getFilteredRowModel,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  BodySize,
  TableColumn,
  HeaderSize,
  PaginationMeta,
  TableSort,
  TableViewClassNames,
} from "./type";
import { cnBase } from "tailwind-variants";
import { Transform } from "./transform";
import { useWrap } from "./hooks/useWrap";
import { useSyncScroll } from "./hooks/useSyncScroll";
import { TablePagination } from "./tablePagination";
import { TableHeader } from "./tableHeader";
import { TableBody } from "./tableBody";
import { useInit } from "./hooks/useInit";
import { TablePlaceholder } from "./tablePlaceholder";
import { useSort } from "./hooks/useSort";

export type TableViewProps<RecordType> = {
  columns: TableColumn<RecordType>[];
  dataSource?: RecordType[] | null;
  /**
   * @description loading state
   * @default false
   */
  loading?: boolean;
  isValidating?: boolean;
  ignoreLoadingCheck?: boolean;
  className?: string;
  classNames?: TableViewClassNames;
  showMaskElement?: boolean;
  emptyView?: ReactNode;
  bordered?: boolean;
  loadMore?: () => void;
  onSort?: (sort?: TableSort) => void;
  initialSort?: TableSort;
  id?: string;
  minHeight?: number;
  initialMinHeight?: number;
  getRowCanExpand?: (row: Row<any>) => boolean;
  expandRowRender?: (row: Row<any>, index: number) => ReactNode;
  manualSorting?: boolean;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  pagination?: PaginationMeta;
  renderRowContainer?: (
    record: RecordType,
    index: number,
    children: ReactNode
  ) => ReactNode;
  generatedRowKey?: CoreOptions<any>["getRowId"];
  onRow?: (record: RecordType, index: number) => any;
  columnFilters?: ColumnFilter | ColumnFilter[];
  rowSelection?: RowSelectionState;
  sizes?: {
    header?: HeaderSize;
    body?: BodySize;
  };
};

const PaginationHeight = 40;

export function TableView<RecordType extends any>(
  props: PropsWithChildren<TableViewProps<RecordType>>
) {
  const {
    dataSource,
    columns,
    className,
    classNames,
    pagination,
    getRowCanExpand,
    // TODO: use internal sort feature
    manualSorting = true,
    manualPagination,
    loading,
    ignoreLoadingCheck,
    emptyView,
    initialSort,
    onSort,
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

  const [sorting, setSorting] = useSort({
    onSort,
    initialSort,
  });

  // const { state: sortState, config: sortConfig } = useMemo(
  //   () => Transform.sorting(onSort, initialSort),
  //   [onSort, initialSort]
  // );

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
      sorting,
      ...paginationState,
      // ...sortState,
    },
    onSortingChange: setSorting,
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
    // ...sortConfig,
  });

  const wrapRef = useWrap();

  const { theadRef, tbodyRef, isYScroll, isXScroll, headerHeight } =
    useSyncScroll([dataSource, pagination?.page, pagination?.pageSize]);

  // filter data
  const rows = table.getRowModel().rows;

  const hasData = !!(dataSource?.length && rows?.length);

  const showPagination = pagination && hasData;

  const showPlaceholder = initialized && (rows.length === 0 || loading);

  return (
    <div
      ref={wrapRef}
      className={cnBase(
        "oui-table-root",
        "oui-overflow-hidden",
        "oui-bg-base-9 oui-w-full oui-h-full",
        "oui-text-xs oui-font-semibold",
        className,
        classNames?.root
      )}
    >
      <div
        ref={theadRef}
        className={cnBase("oui-overflow-x-hidden", "oui-text-base-contrast-36")}
      >
        {initialized && hasData && (
          <TableHeader
            className={classNames?.header}
            headerGroups={table.getHeaderGroups()}
            bordered={props.bordered}
            size={props.sizes?.header}
          />
        )}
      </div>
      <div
        ref={tbodyRef}
        style={{
          height: showPagination
            ? `calc(100% - ${PaginationHeight + headerHeight}px)`
            : `calc(100% - ${headerHeight}px)`,
        }}
        className={cnBase(
          "oui-text-base-contrast-80 oui-relative oui-min-h-[277px]",
          "oui-overflow-auto oui-custom-scrollbar",
          isXScroll && isYScroll ? "oui-w-[calc(100%_+_6px)]" : "oui-w-full",
          classNames?.scroll
        )}
      >
        <TableBody
          className={classNames?.body}
          rows={rows}
          bordered={props.bordered}
          size={props.sizes?.body}
          renderRowContainer={props.renderRowContainer}
          expandRowRender={props.expandRowRender}
          onRow={props.onRow}
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
          count={pagination?.count!}
          pageTotal={pagination?.pageTotal!}
          page={pagination?.page}
          pageSize={pagination?.pageSize}
          onPageChange={pagination?.onPageChange}
          onPageSizeChange={pagination?.onPageSizeChange}
        />
      )}
    </div>
  );
}

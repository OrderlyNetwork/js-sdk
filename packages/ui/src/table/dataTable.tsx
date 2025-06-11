import { PropsWithChildren, ReactNode, useEffect, useMemo } from "react";
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
  TableFeature,
  Table,
  Column as TanstackColumn,
  ExpandedState,
  OnChangeFn,
} from "@tanstack/react-table";
import { cnBase, cn } from "tailwind-variants";
import { useInit } from "./hooks/useInit";
import { useScroll } from "./hooks/useScroll";
import { useShowHeader } from "./hooks/useShowHeader";
import { useShowPagination } from "./hooks/useShowPagination";
import { useSort } from "./hooks/useSort";
import { useWrap } from "./hooks/useWrap";
import { TableBody } from "./tableBody";
import { TableHeader } from "./tableHeader";
import { TablePagination } from "./tablePagination";
import { TablePlaceholder } from "./tablePlaceholder";
import { Transform } from "./transform";
import { Column, PaginationMeta, TableSort, DataTableClassNames } from "./type";

export type DataTableProps<RecordType> = {
  columns: Column<RecordType>[];
  dataSource?: RecordType[] | null;
  /**
   * @description loading state
   * @default false
   */
  loading?: boolean;
  // isValidating?: boolean;
  ignoreLoadingCheck?: boolean;
  className?: string;
  classNames?: DataTableClassNames;
  // showMaskElement?: boolean;
  emptyView?: ReactNode;
  bordered?: boolean;
  // loadMore?: () => void;
  onSort?: (sort?: TableSort) => void;
  initialSort?: TableSort;
  id?: string;
  // minHeight?: number;
  // initialMinHeight?: number;
  getRowCanExpand?: (row: Row<any>) => boolean;
  expandRowRender?: (row: Row<any>, index: number) => ReactNode;
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;
  getSubRows?: (record: any, index: number) => undefined | any[];
  manualSorting?: boolean;
  manualPagination?: boolean;
  manualFiltering?: boolean;
  pagination?: PaginationMeta;
  renderRowContainer?: (
    record: RecordType,
    index: number,
    children: ReactNode,
  ) => ReactNode;
  generatedRowKey?: CoreOptions<any>["getRowId"];
  onRow?: (record: RecordType, index: number) => any;
  onCell?: (
    column: TanstackColumn<any>,
    record: RecordType,
    index: number,
  ) => any;
  columnFilters?: ColumnFilter | ColumnFilter[];
  rowSelection?: RowSelectionState;

  // test id
  testIds?: {
    body?: string;
  };
  features?: TableFeature[];
  getTableInstance?: (table: Table<RecordType>) => void;
};

export function DataTable<RecordType extends any>(
  props: PropsWithChildren<DataTableProps<RecordType>>,
) {
  const {
    columns,
    className,
    classNames,
    pagination,
    getRowCanExpand,
    manualPagination,
    loading,
    ignoreLoadingCheck,
    emptyView,
    initialSort,
    manualSorting,
    onSort,
    expanded,
    onExpandedChange,
  } = props;

  const dataSource = useMemo(() => {
    if (!props.dataSource) {
      return [];
    }

    return props.dataSource;
  }, [props.dataSource]);

  const formatColumns = useMemo(() => Transform.columns(columns), [columns]);

  const columnPinning = useMemo(
    () => Transform.columnPinning(columns),
    [columns],
  );

  const rowSelection = useMemo(
    () => props.rowSelection || {},
    [props.rowSelection],
  );

  const { state: paginationState, config: paginationConfig } = useMemo(
    () => Transform.pagination(pagination),
    [pagination],
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
    _features: props.features,
    data: dataSource!,
    columns: formatColumns,
    state: {
      columnPinning,
      columnFilters,
      rowSelection,
      sorting,
      expanded,
      ...paginationState,
      // ...sortState,
    },
    onSortingChange: setSorting,
    // onColumnFiltersChange: setColumnFilters,
    getRowId: props.generatedRowKey,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand,
    onExpandedChange,
    getSubRows: props.getSubRows,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // use pre-sorted row model instead of sorted row model
    manualSorting,
    // turn off client-side pagination
    manualPagination,
    // only allow a single row to be selected at once
    enableMultiRowSelection: false,
    enableExpanding: true,
    ...paginationConfig,
    // ...sortConfig,
  });

  useEffect(() => {
    props.getTableInstance?.(table);
  }, [table]);

  const wrapRef = useWrap([className, classNames?.root]);
  const { scrollRef, showLeftShadow, showRightShadow } = useScroll([
    dataSource?.length,
  ]);

  // filter data
  const rows = table.getRowModel().rows;

  const showPlaceholder = initialized && (rows.length === 0 || loading);

  const showHeader = useShowHeader({
    loading,
    dataSource,
  });

  const showPagination = useShowPagination({
    loading,
    dataSource,
    rows,
    pagination,
  });

  return (
    <div
      ref={wrapRef}
      id={props.id}
      className={cn(
        "oui-table-root oui-size-full",
        "oui-bg-base-9",
        className,
        classNames?.root,
      )({
        twMerge: true,
      })}
    >
      <div
        ref={scrollRef}
        className={cn(
          "oui-table-scroll oui-relative",
          "oui-min-h-[162px] oui-w-full",
          "oui-text-xs oui-font-semibold",
          "oui-custom-scrollbar oui-overflow-auto",
          showPagination ? "oui-h-[calc(100%_-_40px)]" : "oui-h-full",
          classNames?.scroll,
        )({
          twMerge: true,
        })}
      >
        <table
          className={cnBase(
            "oui-w-full",
            "oui-table-fixed oui-border-collapse",
          )}
        >
          {showHeader && (
            <TableHeader
              className={classNames?.header}
              headerGroups={table.getHeaderGroups()}
              bordered={props.bordered}
              showLeftShadow={showLeftShadow}
              showRightShadow={showRightShadow}
            />
          )}

          <TableBody
            className={classNames?.body}
            rows={rows}
            bordered={props.bordered}
            renderRowContainer={props.renderRowContainer}
            expandRowRender={props.expandRowRender}
            onRow={props.onRow}
            onCell={props.onCell}
            showLeftShadow={showLeftShadow}
            showRightShadow={showRightShadow}
            testId={props.testIds?.body}
          />
        </table>

        <TablePlaceholder
          visible={showPlaceholder}
          loading={loading}
          emptyView={emptyView}
        />
      </div>

      {showPagination && (
        <TablePagination
          className={classNames?.pagination}
          count={pagination?.count || rows?.length}
          pageTotal={pagination?.pageTotal || table.getPageCount()}
          page={pagination?.page!}
          pageSize={pagination?.pageSize}
          onPageChange={pagination?.onPageChange}
          onPageSizeChange={pagination?.onPageSizeChange}
        />
      )}
    </div>
  );
}

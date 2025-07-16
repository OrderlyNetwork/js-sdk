import {
  ColumnSort,
  createColumnHelper,
  getPaginationRowModel,
  PaginationTableState,
  SortingState,
  SortingTableState,
  TableOptions,
  OnChangeFn,
} from "@tanstack/react-table";
import { PaginationMeta, Column, TableSort, SortOrder } from "./type";

/**
 * Create a sorting comparator for multiSort fields
 */
const createMultiSortComparator = (sortId: string, isDesc: boolean) => {
  return (a: any, b: any) => {
    // Support nested field access (e.g., "user.name" or "data.price.value")
    const getNestedValue = (obj: any, path: string) => {
      return path.split(".").reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
      }, obj);
    };

    const aValue = getNestedValue(a, sortId) ?? a[sortId];
    const bValue = getNestedValue(b, sortId) ?? b[sortId];

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Numeric comparison
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return isDesc ? bNum - aNum : aNum - bNum;
    }

    // String comparison with enhanced support for complex strings
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr, undefined, {
      sensitivity: "base",
      numeric: true, // Handle numeric sequences in strings like "PERP_1000PEPE_USDC"
    });

    return isDesc ? -comparison : comparison;
  };
};

export const Transform = {
  columns: (
    columns: Column[],
    sorting?: SortingState,
    setSorting?: OnChangeFn<SortingState>,
  ) => {
    const columnHelper = createColumnHelper<any>();

    return columns?.map((column, index) => {
      // Create a copy of column to avoid mutating the original
      let columnCopy = { ...column };

      const { dataIndex, onSort, multiSort } = columnCopy;

      // For multi-field sorting, provide default onSort if not provided
      const isMultiSort = Boolean(multiSort);

      // If multiSort is enabled but no onSort is provided, create default handler
      if (isMultiSort && multiSort && !multiSort.onSort && setSorting) {
        columnCopy = {
          ...columnCopy,
          multiSort: {
            ...multiSort,
            onSort: (fieldKey: string, sortOrder?: SortOrder) => {
              if (!setSorting) return;

              if (!sortOrder) {
                // Clear sorting
                setSorting([]);
              } else {
                // Set sorting for the field with custom sorting function
                setSorting([
                  {
                    id: fieldKey,
                    desc: sortOrder === "desc",
                  },
                ]);
              }
            },
          },
        };
      }

      const commonProps = {
        meta: columnCopy,
        size: columnCopy.width || 100,
      };

      return columnHelper.accessor(dataIndex, {
        header: () => columnCopy.title,
        enableSorting: onSort && !isMultiSort ? true : false, // Disable sorting for multiSort columns
        sortingFn:
          typeof onSort === "function"
            ? (rowA, rowB, columnId) => onSort?.(rowA.original, rowB.original)
            : "alphanumeric",
        ...commonProps,
      });
    });
  },

  dataSource: <T>(
    dataSource: T[],
    columns: Column[],
    sorting?: SortingState,
  ): T[] => {
    if (
      !dataSource ||
      dataSource.length === 0 ||
      !sorting ||
      sorting.length === 0
    ) {
      return dataSource || [];
    }

    const currentSort = sorting[0];
    const sortId = currentSort.id;

    // Check if this sort ID matches any multiSort field
    const multiSortColumn = columns.find((col) =>
      col.multiSort?.fields?.some((field) => field.sortKey === sortId),
    );

    if (!multiSortColumn) {
      return dataSource; // Not a multiSort field, return original data
    }

    // Create a copy and sort using the optimized comparator
    const sortedData = [...dataSource].sort(
      createMultiSortComparator(sortId, currentSort.desc),
    );

    return sortedData;
  },

  columnPinning: (columns: Column[]) => {
    const left: string[] = [];
    const right: string[] = [];
    columns?.map((column) => {
      if (column.fixed === "left") {
        left.push(column.dataIndex);
      } else if (column.fixed === "right") {
        right.push(column.dataIndex);
      }
    });

    return { left, right };
  },

  pagination: (pagination?: PaginationMeta) => {
    let state = {} as PaginationTableState;
    let config = {} as Pick<
      TableOptions<any>,
      "getPaginationRowModel" | "onPaginationChange"
    >;
    if (pagination) {
      state = {
        pagination: {
          pageIndex: pagination.page - 1,
          pageSize: pagination.pageSize,
        },
      };
      config = {
        // no need to set onPaginationChange
        // onPaginationChange,
        // load client-side pagination code
        getPaginationRowModel: getPaginationRowModel(),
      };
    }
    return { state, config };
  },
  // sorting: (onSort?: (sort?: TableSort) => void, initialSort?: TableSort) => {
  //   let state = {} as SortingTableState;
  //   let config = {} as Pick<TableOptions<any>, "onSortingChange">;

  //   if (typeof onSort === "function") {
  //     config = {
  //       onSortingChange: (updaterFn: any) => {
  //         const sorting = updaterFn() as ColumnSort[];
  //         const { id, desc } = sorting[0];
  //         onSort({ sortKey: id, sort: desc ? "desc" : "asc" });
  //       },
  //     };
  //   }

  //   if (initialSort) {
  //     state = {
  //       sorting: [
  //         {
  //           id: initialSort.sortKey,
  //           desc: initialSort.sort === "desc",
  //         },
  //       ],
  //     } as SortingTableState;
  //   }

  //   return { state, config };
  // },
};

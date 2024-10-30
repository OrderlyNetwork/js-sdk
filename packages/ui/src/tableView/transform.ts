import {
  ColumnSort,
  createColumnHelper,
  getPaginationRowModel,
  PaginationTableState,
  SortingState,
  SortingTableState,
  TableOptions,
} from "@tanstack/react-table";
import { PaginationMeta, TableColumn, TableSort } from "./type";

export const Transform = {
  columns: (columns: TableColumn[]) => {
    const columnHelper = createColumnHelper<any>();

    return columns?.map((column, index) => {
      const commonProps = {
        meta: column,
        size: column.width || 100,
      };

      // if (column.type === "action") {
      //   return columnHelper.display({
      //     // id: `${"actions"}_${index}`,
      //     ...commonProps,
      //   });
      // }
      const { dataIndex, onSort } = column;

      return columnHelper.accessor(dataIndex, {
        header: () => column.title,
        enableSorting: onSort ? true : false,
        sortingFn:
          typeof onSort === "function"
            ? (rowA, rowB, columnId) => onSort?.(rowA.original, rowB.original)
            : "alphanumeric",
        ...commonProps,
      });
    });
  },

  columnPinning: (columns: TableColumn[]) => {
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

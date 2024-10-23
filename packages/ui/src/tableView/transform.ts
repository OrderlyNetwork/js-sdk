import {
  createColumnHelper,
  getPaginationRowModel,
  PaginationState,
  PaginationTableState,
  TableOptions,
} from "@tanstack/react-table";
import { Column } from "../table";

export const Transform = {
  columns: (columns: Column[]) => {
    const columnHelper = createColumnHelper<any>();

    return columns?.map((column) => {
      return columnHelper.accessor(column.dataIndex, {
        header: () => column.title,
        cell: (record) => {
          const value = record.getValue();
          const { original, index } = record.row;
          if (typeof column.render === "function") {
            return column.render(value, original, index);
          }
          return value;
        },
        enableSorting: column?.onSort ? true : false,
        meta: column,
        size: column.width,
      });
    });
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

  pagination: (pagination?: PaginationState) => {
    let state = {} as PaginationTableState;
    let config = {} as Pick<
      TableOptions<any>,
      "getPaginationRowModel" | "onPaginationChange"
    >;
    if (pagination) {
      state = {
        pagination: {
          ...pagination,
          pageIndex: pagination.pageIndex - 1,
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
};

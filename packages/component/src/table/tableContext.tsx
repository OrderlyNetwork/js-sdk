import {
  FC,
  PropsWithChildren,
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Column, SortOrder } from "./col";

export interface TableContextState {
  columns: Column[];
  dataSource: any[];
  sortKey?: string;
  sortOrder?: SortOrder;
  onSort: (key: string) => void;
  getLeftFixedColumnsWidth: (index: number) => number;
  getRightFixedColumnsWidth: (index: number) => number;
  getLeftFixedColumnsPosition: () => number;
  getRightFixedColumnsPosition: () => number;
}

export const TableContext = createContext<TableContextState>(
  {} as TableContextState
);

export const defaultSortter = (r1: any, r2: any, sortOrder: SortOrder) => {
  if (sortOrder === "asc") {
    return Number(r1.price) - Number(r2.price);
  }
  return Number(r2.price) - Number(r1.price);
};

export const TableProvider: FC<
  PropsWithChildren<{
    columns: Column[];
    dataSource?: any[] | null;
  }>
> = (props) => {
  const [sortKey, setSortKey] = useState<[string, SortOrder] | undefined>();
  // const [sortOrder, setSortOrder] = useState<SortOrder>();

  const getLeftFixedColumnsWidth = (index: number) => {
    return props.columns.reduce((acc, cur, i) => {
      if (i < index && cur.fixed === "left") {
        return acc + (cur.width || 0);
      }
      return acc;
    }, 0);
  };

  const getRightFixedColumnsWidth = (index: number) => {
    return props.columns.reduce((acc, cur, i) => {
      if (i > index && cur.fixed === "right") {
        return acc + (cur.width || 0);
      }
      return acc;
    }, 0);
  };

  const getLeftFixedColumnsPosition = () => {
    let left = 0;

    for (let index = 0; index < props.columns.length; index++) {
      const element = props.columns[index];
      if (element.fixed !== "left") {
        break;
      } else {
        left += element.width || 0;
      }
    }
    return left;
  };

  const getRightFixedColumnsPosition = () => {
    let right = 0;

    for (let index = props.columns.length - 1; index >= 0; index--) {
      const element = props.columns[index];
      if (element.fixed !== "right") {
        break;
      } else {
        right += element.width || 0;
      }
    }
    return right;
  };

  const dataSource = useMemo(() => {
    if (!props.dataSource) {
      return [];
    }
    if (!sortKey || !sortKey[0]) {
      return props.dataSource || [];
    }
    // sort by onSort function
    return [...props.dataSource].sort((r1, r2) => {
      if (typeof sortKey[0] === "string") {
        const col = props.columns.find((col) => col.dataIndex === sortKey[0]);
        let sorttor =
          typeof col?.onSort === "function" ? col.onSort : defaultSortter;

        return sorttor(r1, r2, sortKey[1]);
      }
      return 0;
    });
  }, [props.dataSource, sortKey]);

  const onSort = (key: string) => {
    setSortKey((prev) => {
      if (prev?.[0] === key) {
        if (prev?.[1] === "asc") {
          return undefined;
        }

        return [key, "asc" as SortOrder];
      }

      return [key, "desc" as SortOrder];
    });
  };

  return (
    <TableContext.Provider
      value={{
        columns: props.columns,
        dataSource: dataSource,
        sortKey: sortKey?.[0],
        sortOrder: sortKey?.[1],
        onSort: onSort,
        getLeftFixedColumnsWidth,
        getRightFixedColumnsWidth,
        getLeftFixedColumnsPosition,
        getRightFixedColumnsPosition,
      }}
    >
      {props.children}
    </TableContext.Provider>
  );
};

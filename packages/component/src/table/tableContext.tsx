import {
  FC,
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
} from "react";
import { Column } from "./col";

export interface TableContextState {
  columns: Column[];
  getLeftFixedColumnsWidth: (index: number) => number;
  getRightFixedColumnsWidth: (index: number) => number;
  getLeftFixedColumnsPosition: () => number;
  getRightFixedColumnsPosition: () => number;
}

export const TableContext = createContext<TableContextState>(
  {} as TableContextState
);

export const TableProvider: FC<
  PropsWithChildren<{
    columns: Column[];
  }>
> = (props) => {
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

  return (
    <TableContext.Provider
      value={{
        columns: props.columns,
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

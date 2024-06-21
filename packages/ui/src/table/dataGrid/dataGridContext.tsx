import { createContext, PropsWithChildren, useContext } from "react";
import { DataFilterProps } from "./dataFilter";

export type PaginationOptions = {
  page: number;
  pageSize: number;
  count: number;
};

export type DataGridContextState = {
  filter?: DataFilterProps;
  pagination?: PaginationOptions;
};

export const DataGridContext = createContext<DataGridContextState>(
  {} as DataGridContextState
);

export const useDataGridContext = () => {
  return useContext(DataGridContext);
};

export const DataGridProvider = (
  props: PropsWithChildren<{
    filter?: DataFilterProps;
    pagination: PaginationOptions;
  }>
) => {
  return (
    <DataGridContext.Provider
      value={{
        filter: props.filter,
        pagination: props.pagination,
      }}
    >
      {props.children}
    </DataGridContext.Provider>
  );
};

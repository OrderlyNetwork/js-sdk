import { createContext, PropsWithChildren, useContext } from "react";
import { DataFilterProps } from "./dataFilter";

type DataGridContextState = {
  filter?: DataFilterProps;
};

export const DataGridContext = createContext<DataGridContextState>(
  {} as DataGridContextState
);

export const useDataGridContext = () => {
  return useContext(DataGridContext);
};

export const DataGridProvider = (
  props: PropsWithChildren<{ filter?: DataFilterProps }>
) => {
  return (
    <DataGridContext.Provider
      value={{
        filter: props.filter,
      }}
    >
      {props.children}
    </DataGridContext.Provider>
  );
};

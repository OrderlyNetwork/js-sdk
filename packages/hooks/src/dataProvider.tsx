import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from "react";
import { useSWRConfig } from "swr";
import { useWS } from "./useWS";
import { usePrivateDataObserver } from "./orderly/usePrivateDataObserver";

interface DataCenterContextValue {}

export const DataCenterContext = createContext<DataCenterContextValue>(
  {} as any
);

export const useDataCenterContext = () => useContext(DataCenterContext);

export const DataCenterProvider = ({ children }: PropsWithChildren) => {
  usePrivateDataObserver();

  return (
    <DataCenterContext.Provider value={{}}>
      {children}
    </DataCenterContext.Provider>
  );
};

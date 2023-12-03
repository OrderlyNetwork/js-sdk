import { PropsWithChildren, createContext, useContext } from "react";
import { usePrivateDataObserver } from "./orderly/usePrivateDataObserver";
import { usePreLoadData } from "./usePreloadData";

interface DataCenterContextValue {
  // orders
  // positions
  // balances
  //
}

export const DataCenterContext = createContext<DataCenterContextValue>(
  {} as any
);

export const useDataCenterContext = () => useContext(DataCenterContext);

export const DataCenterProvider = ({ children }: PropsWithChildren) => {
  /**
   *  preload the required data for the app
   *  hidden view while the required data is not ready
   */
  const { error, done } = usePreLoadData();

  usePrivateDataObserver();

  if (error) {
    return <div>Data load failed</div>;
  }

  if (!done) return null;

  return (
    <DataCenterContext.Provider value={{}}>
      {children}
    </DataCenterContext.Provider>
  );
};

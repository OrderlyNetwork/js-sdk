import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useRef,
} from "react";
import { CalculatorService } from "./orderly/calculator/calculatorService";
import { useWSObserver } from "./orderly/internal/useWSObserver";
import { usePrivateDataObserver } from "./orderly/usePrivateDataObserver";
import { usePublicDataObserver } from "./orderly/usePublicDataObserver";
import { useCalculatorService } from "./useCalculatorService";
import { usePreLoadData } from "./usePreloadData";
import { useSimpleDI } from "./useSimpleDI";

export type getKeyFunction = (index: number, prevData: any) => string | null;

interface DataCenterContextState {
  // orders
  // positions
  // balances
  //
  registerKeyHandler: (key: string, handler: getKeyFunction) => void;
  unregisterKeyHandler: (key: string) => void;
}

export const DataCenterContext = createContext<DataCenterContextState>(
  {} as any,
);

export const useDataCenterContext = () => useContext(DataCenterContext);

export const DataCenterProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  /**
   *  preload the required data for the app
   *  hidden view while the required data is not ready
   */
  const { error, done } = usePreLoadData();

  const calculatorService = useCalculatorService();

  usePublicDataObserver();

  /**
   * WS observer
   */
  useWSObserver(calculatorService);

  const getKeyHandlerMapRef = useRef<Map<string, getKeyFunction>>(new Map());

  usePrivateDataObserver({
    getKeysMap(type) {
      return getKeyHandlerMapRef.current;
    },
  });

  const memoizedValue = useMemo<DataCenterContextState>(() => {
    return {
      registerKeyHandler: (key, fun) => {
        getKeyHandlerMapRef.current.set(key, fun);
      },
      unregisterKeyHandler: (key) => {
        getKeyHandlerMapRef.current.delete(key);
      },
    };
  }, [getKeyHandlerMapRef.current]);

  if (error) {
    return <div>Data load failed</div>;
  }

  if (!done) {
    return null;
  }

  return (
    <DataCenterContext.Provider value={memoizedValue}>
      {children}
    </DataCenterContext.Provider>
  );
};

import React, { PropsWithChildren, useMemo, useRef } from "react";
import { useWSObserver } from "../../orderly/internal/useWSObserver";
import { usePrivateDataObserver } from "../../orderly/usePrivateDataObserver";
import { usePublicDataObserver } from "../../orderly/usePublicDataObserver";
import { useCalculatorService } from "../../useCalculatorService";
import { usePreLoadData } from "../../usePreloadData";
import {
  DataCenterContext,
  DataCenterContextState,
  getKeyFunction,
} from "./dataCenterContext";
import { useInitRwaSymbolsRuntime } from "../../orderly/orderlyHooks";

export const DataCenterProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  /**
   *  preload the required data for the app
   *  hidden view while the required data is not ready
   */
  const { error, done } = usePreLoadData();

  useInitRwaSymbolsRuntime();

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

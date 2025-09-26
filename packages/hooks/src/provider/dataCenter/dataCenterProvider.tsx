import React, { PropsWithChildren, useMemo, useRef } from "react";
import { useWSObserver } from "../../orderly/internal/useWSObserver";
import { usePrivateDataObserver } from "../../orderly/usePrivateDataObserver";
import { usePublicDataObserver } from "../../orderly/usePublicDataObserver";
import { useCalculatorService } from "../../useCalculatorService";
import { useDatabaseInitialization } from "../../useDatabaseInitialization";
import { usePreLoadData } from "../../usePreloadData";
import {
  DataCenterContext,
  DataCenterContextState,
  getKeyFunction,
} from "./dataCenterContext";

export const DataCenterProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  /**
   *  preload the required data for the app
   *  hidden view while the required data is not ready
   */
  useDatabaseInitialization();
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

  // if (databaseError) {
  //   return (
  //     <div>{`Database initialization failed: ${databaseError.message}`}</div>
  //   );
  // }

  if (error) {
    return <div>Data load failed</div>;
  }

  // if (!done) {
  //   return null;
  // }

  return (
    <DataCenterContext.Provider value={memoizedValue}>
      {children}
    </DataCenterContext.Provider>
  );
};

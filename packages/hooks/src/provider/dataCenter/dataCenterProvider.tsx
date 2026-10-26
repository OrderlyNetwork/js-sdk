import React, { PropsWithChildren, useMemo, useState } from "react";
import { useWSObserver } from "../../orderly/internal/useWSObserver";
import { useInitRwaSymbolsRuntime } from "../../orderly/orderlyHooks";
import { usePrivateDataObserver } from "../../orderly/usePrivateDataObserver";
import { usePublicDataObserver } from "../../orderly/usePublicDataObserver";
import { useCalculatorService } from "../../useCalculatorService";
import { useDatabaseInitialization } from "../../useDatabaseInitialization";
import { usePreLoadData } from "../../usePreloadData";
import { DataCenterContext, DataCenterContextState } from "./dataCenterContext";
import { createOrderKeyRegistry } from "./orderKeyRegistry";

export const DataCenterProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  /**
   *  preload the required data for the app
   *  hidden view while the required data is not ready
   */
  useDatabaseInitialization();
  const { error, done } = usePreLoadData();

  useInitRwaSymbolsRuntime();

  const calculatorService = useCalculatorService();

  usePublicDataObserver();

  /**
   * WS observer
   */
  useWSObserver(calculatorService);

  const [registry] = useState(createOrderKeyRegistry);

  usePrivateDataObserver({
    getKeysMap(type) {
      return registry.handlers;
    },
  });

  const memoizedValue = useMemo<DataCenterContextState>(() => {
    return {
      registerKeyHandler: registry.register,
      unregisterKeyHandler: registry.unregister,
    };
  }, [registry]);

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

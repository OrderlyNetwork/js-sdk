import React, { createContext, useContext, useMemo } from "react";

export type ExtensionContextState = {};

export const ExtensionContext = createContext<ExtensionContextState>({});

export const useExtensionContext = () => {
  return useContext<ExtensionContextState>(ExtensionContext);
};

export const ExtensionProvider: React.FC<React.PropsWithChildren> = (props) => {
  const { children } = props;
  const memoizedValue = useMemo<ExtensionContextState>(() => ({}), []);
  return (
    <ExtensionContext.Provider value={memoizedValue}>
      {children}
    </ExtensionContext.Provider>
  );
};

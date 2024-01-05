import { FC, PropsWithChildren, createContext, useContext } from "react";

export type PluginContextState = {};

export const ExtensionContext = createContext({} as PluginContextState);

export const useExtensionContext = () => {
  return useContext(ExtensionContext);
};

export const PluginProvider: FC<PropsWithChildren> = (props) => {
  return (
    <ExtensionContext.Provider value={{}}>
      {props.children}
    </ExtensionContext.Provider>
  );
};

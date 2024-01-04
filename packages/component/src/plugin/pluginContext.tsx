import { FC, PropsWithChildren, createContext } from "react";

export type PluginContextState = {};

export const PluginContext = createContext({} as PluginContextState);

export const PluginProvider: FC<PropsWithChildren> = (props) => {
  return (
    <PluginContext.Provider value={{}}>{props.children}</PluginContext.Provider>
  );
};

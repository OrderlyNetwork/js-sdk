import {
  FC,
  PropsWithChildren,
  Suspense,
  createContext,
  useContext,
} from "react";

export type PluginContextState = {};

export const ExtensionContext = createContext({} as PluginContextState);

export const useExtensionContext = () => {
  return useContext(ExtensionContext);
};

interface PluginProviderProps {}

export const PluginProvider: FC<PropsWithChildren<PluginProviderProps>> = (
  props
) => {
  return (
    <ExtensionContext.Provider value={{}}>
      {props.children}
    </ExtensionContext.Provider>
  );
};

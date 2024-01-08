import { FC, PropsWithChildren, createContext, useContext } from "react";

export type ExtensionContextState = {};

export const ExtensionContext = createContext({} as ExtensionContextState);

export const useExtensionContext = () => {
  return useContext(ExtensionContext);
};

interface ExtensionProviderProps {}

export const ExtensionProvider: FC<
  PropsWithChildren<ExtensionProviderProps>
> = (props) => {
  return (
    <ExtensionContext.Provider value={{}}>
      {props.children}
    </ExtensionContext.Provider>
  );
};

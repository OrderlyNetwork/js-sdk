import { FC, PropsWithChildren, createContext } from "react";

export interface ConfigDataContextState {
  config: any;
}

export const ConfigDataContext = createContext<ConfigDataContextState>(
  {} as ConfigDataContextState
);

export const ConfigDataProvider: FC<PropsWithChildren> = (props) => {
  return (
    <ConfigDataContext.Provider value={{ config: {} }}>
      {props.children}
    </ConfigDataContext.Provider>
  );
};

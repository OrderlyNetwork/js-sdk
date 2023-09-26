import { FC, PropsWithChildren, createContext } from "react";

export interface ConfigDataContextState {
  config: any;
  chains: any[];
}

export const ConfigDataContext = createContext<ConfigDataContextState>(
  {} as ConfigDataContextState
);

export const ConfigDataProvider: FC<PropsWithChildren> = (props) => {
  return (
    <ConfigDataContext.Provider value={{ config: {}, chains: [] }}>
      {props.children}
    </ConfigDataContext.Provider>
  );
};

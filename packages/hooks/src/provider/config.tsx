import { FC, PropsWithChildren, createContext, useMemo } from "react";
import { useSymbolsInfo } from "../orderly/useSymbolsInfo";
import useConstant from "use-constant";
import React from "react";

export interface ConfigDataContextValue {
  //   symbol: string;
  config: any;
  data: any;
}

export const ConfigDataContext = createContext({} as ConfigDataContextValue);

export interface ConfigDataProviderProps {}

export const ConfigDataProvider: FC<PropsWithChildren> = (props) => {
  const { data } = useSymbolsInfo();

  const config = useMemo(() => {
    return new Proxy(
      {},
      {
        get(target: any, property, receiver) {
          return (value: string) => {
            if (value) {
              console.log(data, property, value);
              return "aaa";
            } else {
              return target[property];
            }

            // return data[value][property];
          };
        },
      }
    );
  }, [data]);

  console.log("data", config.symbol("ticker"));

  return (
    <ConfigDataContext.Provider value={{ config, data }}>
      {props.children}
    </ConfigDataContext.Provider>
  );
};

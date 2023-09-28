import { SimpleDI } from "@orderly.network/core";
import React, {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
} from "react";
import { SWRConfig } from "swr";
import useConstant from "use-constant";
import { DataSource } from "../services/dataSource";
import { useAccountInstance } from "../useAccountInstance";
import { getWebSocketClient } from "../utils/getWebSocketClient";
import { get } from "@orderly.network/net";
import { OrderlyContext } from "../orderlyContext";

interface DataSourceContextState {
  // dataSource: DataSource;
  // fetcher: typeof fetch;
}

export const DataSourceContext = createContext({} as DataSourceContextState);

export const DataSourceProvider: FC<PropsWithChildren> = (props) => {
  console.log("render DataSourceProvider");
  const account = useAccountInstance();

  const dataSource = useConstant(() => {
    // let dataSource = SimpleDI.get<DataSource>(DataSource.instanceName);
    // if (!dataSource) {
    //   const ws = getWebSocketClient(account);
    //   dataSource = new DataSource(account, ws);
    //   SimpleDI.registerByName(DataSource.instanceName, dataSource);
    // }
    // return dataSource;
  });

  return (
    <DataSourceContext.Provider value={{}}>
      {/* <SWRConfig
        value={{
          provider: () => dataSource.swrCacheProvider,
        }}
      > */}
      {props.children}
      {/* </SWRConfig> */}
    </DataSourceContext.Provider>
  );
};

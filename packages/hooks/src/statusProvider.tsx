import { PropsWithChildren, createContext } from "react";
import { useWsStatus, type WsNetworkStatus } from "./useWsStatus";

export interface StatusContextState {
  ws?: WsNetworkStatus;
}

export const StatusContext = createContext({} as StatusContextState);

export const StatusProvider: React.FC<PropsWithChildren> = (props) => {
  const wsStatus = useWsStatus();

  return (
    <StatusContext.Provider value={{ ws: wsStatus }}>
      {props.children}
    </StatusContext.Provider>
  );
};

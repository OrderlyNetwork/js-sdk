import { PropsWithChildren, createContext, useMemo } from "react";
import { useWsStatus, type WsNetworkStatus } from "./useWsStatus";

export interface StatusContextState {
  ws?: WsNetworkStatus;
}

export const StatusContext = createContext<StatusContextState>({});

export const StatusProvider: React.FC<PropsWithChildren> = (props) => {
  const wsStatus = useWsStatus();
  const memoizedValue = useMemo<StatusContextState>(() => {
    return { ws: wsStatus };
  }, [wsStatus]);
  return (
    <StatusContext.Provider value={memoizedValue}>
      {props.children}
    </StatusContext.Provider>
  );
};

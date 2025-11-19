import { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { RouteOption } from "@orderly.network/types";

export type RouteContextState = {
  onRouteChange: (option: RouteOption) => void;
};

export const RouteContext = createContext<RouteContextState>({
  onRouteChange: () => {},
} as RouteContextState);

type RouteProviderProps = RouteContextState & {
  children: ReactNode;
};

export const RouteProvider: FC<RouteProviderProps> = (props) => {
  const vaule = useMemo(() => {
    return {
      onRouteChange: props.onRouteChange,
    };
  }, [props.onRouteChange]);

  return (
    <RouteContext.Provider value={vaule}>
      {props.children}
    </RouteContext.Provider>
  );
};

export const useRouteContext = () => {
  return useContext(RouteContext);
};

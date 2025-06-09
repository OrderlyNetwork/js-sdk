import {
  PropsWithChildren,
  createContext,
  useContext,
  useState,
  useMemo,
} from "react";
import { RouterAdapter } from "@orderly.network/ui-scaffold";

type LayoutContextValue = {
  sideOpen: boolean;
  onSideOpenChange: (open: boolean) => void;
  routerAdapter?: RouterAdapter;
};

const LayoutContext = createContext<LayoutContextValue>({
  sideOpen: true,
} as LayoutContextValue);

export const useLayoutContext = () => {
  return useContext(LayoutContext);
};

export const LayoutProvider = (
  props: PropsWithChildren<{ routerAdapter?: RouterAdapter }>,
) => {
  const [sideOpen, setSideOpen] = useState(true);
  const memoizedValue = useMemo<LayoutContextValue>(
    () => ({
      sideOpen,
      onSideOpenChange: setSideOpen,
      routerAdapter: props.routerAdapter,
    }),
    [sideOpen, setSideOpen, props.routerAdapter],
  );
  return (
    <LayoutContext.Provider value={memoizedValue}>
      {props.children}
    </LayoutContext.Provider>
  );
};

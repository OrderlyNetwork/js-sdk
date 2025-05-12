import { PropsWithChildren, createContext, useContext, useState } from "react";
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
  return (
    <LayoutContext.Provider
      value={{
        sideOpen,
        onSideOpenChange: setSideOpen,
        routerAdapter: props.routerAdapter,
      }}
    >
      {props.children}
    </LayoutContext.Provider>
  );
};

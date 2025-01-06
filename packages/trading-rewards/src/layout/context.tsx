import { PropsWithChildren, createContext, useState } from "react";

type LayoutContextValue = {
  sideOpen: boolean;
  onSideOpenChange: (open: boolean) => void;
};

const LayoutContext = createContext<LayoutContextValue>({
  sideOpen: true,
} as LayoutContextValue);

export const LayoutProvider = (props: PropsWithChildren) => {
  const [sideOpen, setSideOpen] = useState(true);
  return (
    <LayoutContext.Provider value={{ sideOpen, onSideOpenChange: setSideOpen }}>
      {props.children}
    </LayoutContext.Provider>
  );
};

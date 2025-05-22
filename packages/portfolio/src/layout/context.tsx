import React, { PropsWithChildren, createContext, useState } from "react";

type LayoutContextValue = {
  sideOpen: boolean;
  onSideOpenChange: (open: boolean) => void;
};

const LayoutContext = createContext<LayoutContextValue>({
  sideOpen: true,
} as LayoutContextValue);

// export

export const LayoutProvider = (props: PropsWithChildren) => {
  const [sideOpen, setSideOpen] = useState(true);
  const memoizedValue = React.useMemo<LayoutContextValue>(
    () => ({ sideOpen, onSideOpenChange: setSideOpen }),
    [sideOpen, setSideOpen],
  );
  return (
    <LayoutContext.Provider value={memoizedValue}>
      {props.children}
    </LayoutContext.Provider>
  );
};

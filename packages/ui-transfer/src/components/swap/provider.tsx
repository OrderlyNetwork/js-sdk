import React, { createContext, useContext, useMemo } from "react";

export interface DepositContextState {}

export const SwapDepositContext = createContext<DepositContextState>({});

export const SwapDepositProvider: React.FC<
  React.PropsWithChildren<DepositContextState>
> = (props) => {
  const { children } = props;
  const memoizedValue = useMemo<DepositContextState>(() => ({}), []);
  return (
    <SwapDepositContext.Provider value={memoizedValue}>
      {children}
    </SwapDepositContext.Provider>
  );
};

export const useSwapDepositContext = () => {
  return useContext<DepositContextState>(SwapDepositContext);
};
